<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AssistantController extends Controller
{
    public function query(Request $request)
    {
        try {
            $request->validate([
                'project_id' => 'required|exists:projects,id',
                'prompt' => 'required|string',
            ]);

            $projectId = $request->input('project_id');
            $userPrompt = $request->input('prompt');
            $user = Auth::user();

            // Load project with all related data
            $project = Project::with([
                'tasks.assignedUser:id,name',
                'tasks.comments.user:id,name',
                'members:id,name'
            ])->findOrFail($projectId);

            // Check if user has access to this project
            if (!$this->userHasAccessToProject($user, $project)) {
                return response()->json([
                    'answer' => 'You do not have access to this project.',
                ], 403);
            }

            // Get user-specific task data
            $userTasks = $this->getUserTasks($user, $project);
            
            // Prepare comprehensive context
            $context = $this->prepareProjectContext($project, $user, $userTasks);

            // Build AI prompt with context
            $fullPrompt = $this->buildIntelligentPrompt($context, $userPrompt, $user);

            // Get AI response
            $aiResponse = $this->callGeminiApi($fullPrompt);

            return response()->json([
                'answer' => $aiResponse,
                'context' => $context, // Optional: for debugging
            ]);

        } catch (\Exception $e) {
            Log::error('AssistantController error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'project_id' => $request->input('project_id'),
                'prompt' => $request->input('prompt'),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'answer' => 'Sorry, I encountered an error processing your request. Please try again.',
            ], 500);
        }
    }

    private function userHasAccessToProject($user, $project)
    {
        // User is owner or member
        return $user->id === $project->user_id || 
               $project->members->contains('id', $user->id);
    }

    private function getUserTasks($user, $project)
    {
        return $project->tasks->filter(function ($task) use ($user) {
            return $task->assignee_id === $user->id;
        });
    }

    private function prepareProjectContext($project, $user, $userTasks)
    {
        $context = [
            'project_name' => $project->name,
            'project_description' => $project->description,
            'user_name' => $user->name,
            'total_tasks' => $project->tasks->count(),
            'task_breakdown' => [
                'todo' => $project->tasks->where('status', 'todo')->count(),
                'in_progress' => $project->tasks->where('status', 'in_progress')->count(),
                'review' => $project->tasks->where('status', 'review')->count(),
                'done' => $project->tasks->where('status', 'done')->count(),
            ],
            'user_tasks' => [
                'total' => $userTasks->count(),
                'in_progress' => $userTasks->where('status', 'in_progress')->count(),
                'in_review' => $userTasks->where('status', 'review')->count(),
                'completed' => $userTasks->where('status', 'done')->count(),
                'todo' => $userTasks->where('status', 'todo')->count(),
            ],
            'overdue_tasks' => $this->getOverdueTasks($project),
            'recent_activity' => $this->getRecentActivity($project),
            'team_members' => $project->members->pluck('name')->toArray(),
        ];

        return $context;
    }

    private function getOverdueTasks($project)
    {
        return $project->tasks->filter(function ($task) {
            return $task->due_date && 
                   $task->due_date < now() && 
                   $task->status !== 'done';
        })->map(function ($task) {
            return [
                'title' => $task->title,
                'assignee' => $task->assignedUser ? $task->assignedUser->name : 'Unassigned',
                'due_date' => $task->due_date,
                'status' => $task->status,
            ];
        })->values()->toArray();
    }

    private function getRecentActivity($project)
    {
        return $project->tasks()
            ->where('updated_at', '>=', now()->subDays(7))
            ->with('assignedUser:id,name')
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(function ($task) {
                return [
                    'title' => $task->title,
                    'status' => $task->status,
                    'assignee' => $task->assignedUser ? $task->assignedUser->name : 'Unassigned',
                    'updated' => $task->updated_at->diffForHumans(),
                ];
            })->toArray();
    }

    private function buildIntelligentPrompt($context, $userPrompt, $user)
    {
        return <<<PROMPT
You are an intelligent project management assistant. You have access to comprehensive project data and can provide specific, actionable insights.

PROJECT CONTEXT:
- Project: {$context['project_name']}
- Description: {$context['project_description']}
- Current User: {$context['user_name']}

TASK OVERVIEW:
- Total Project Tasks: {$context['total_tasks']}
- Todo: {$context['task_breakdown']['todo']}
- In Progress: {$context['task_breakdown']['in_progress']}
- In Review: {$context['task_breakdown']['review']}
- Completed: {$context['task_breakdown']['done']}

USER'S PERSONAL TASKS:
- Total Assigned to You: {$context['user_tasks']['total']}
- Your Tasks in Progress: {$context['user_tasks']['in_progress']}
- Your Tasks in Review/QA: {$context['user_tasks']['in_review']}
- Your Todo Tasks: {$context['user_tasks']['todo']}
- Your Completed Tasks: {$context['user_tasks']['completed']}

OVERDUE TASKS: " . (count($context['overdue_tasks']) > 0 ? json_encode($context['overdue_tasks']) : "None") . "

RECENT ACTIVITY: " . json_encode($context['recent_activity']) . "

TEAM MEMBERS: " . implode(', ', $context['team_members']) . "

USER QUESTION: "{$userPrompt}"

Instructions:
1. Provide specific, data-driven answers based on the project context above
2. If asked about personal tasks, focus on the user's assigned tasks
3. Suggest actionable next steps when appropriate
4. Identify potential issues or delays based on the data
5. Be concise but comprehensive
6. If the question is not project-related, politely redirect to project management topics

Common queries you should handle well:
- "What tasks do I have in progress?"
- "What do I have in QA?" (review status)
- "What are the remaining tasks for this sprint?"
- "Are there any overdue tasks?"
- "What's the project status?"
- "Who is working on what?"
PROMPT;
    }

    private function callGeminiApi($prompt)
    {
        $apiKey = env('GEMINI_API_KEY');
        
        if (!$apiKey) {
            throw new \Exception('Gemini API key not configured');
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}";

        $response = Http::timeout(30)->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.3,
                'topP' => 0.8,
                'maxOutputTokens' => 1000,
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('AI service unavailable');
        }

        $responseData = $response->json();

        return $responseData['candidates'][0]['content']['parts'][0]['text'] ?? 
               'I apologize, but I could not generate a response at this time.';
    }
}