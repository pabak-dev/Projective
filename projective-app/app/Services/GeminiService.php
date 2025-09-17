<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\GeminiService; // Import your service
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AssistantController extends Controller
{
    protected $geminiService;

    // Use dependency injection to get the GeminiService
    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    public function query(Request $request)
    {
        try {
            $request->validate([
                'project_id' => 'required|exists:projects,id',
                'prompt' => 'required|string',
            ]);

            $projectId = $request->input('project_id');
            $userPrompt = $request->input('prompt');

            // 1. Load the project data
            $project = Project::with('tasks.assignee')->findOrFail($projectId);

            // 2. Prepare a context for the AI using the project data
            $projectContext = $this->prepareProjectContext($project);

            // 3. Combine the context with the user's prompt
            $fullPrompt = $this->buildPrompt($projectContext, $userPrompt);

            // 4. Use the GeminiService to get the AI response
            $aiResponse = $this->geminiService->getResponse($fullPrompt);

            // 5. Return the AI's response
            return response()->json([
                'answer' => $aiResponse,
                'tasks' => $project->tasks,
            ]);

        } catch (\Exception $e) {
            Log::error('AssistantController error: ' . $e->getMessage());

            return response()->json([
                'answer' => 'Sorry, an error occurred while processing your request.',
                'tasks' => [],
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Prepares a string context from the Project model
     */
    private function prepareProjectContext(Project $project): string
    {
        $context = "Project Name: {$project->name}\n";
        $context .= "Description: {$project->description}\n";
        $context .= "Total Tasks: {$project->tasks->count()}\n\n";

        if ($project->tasks->count() > 0) {
            $context .= "Tasks:\n";
            foreach ($project->tasks as $task) {
                $status = $task->status ?? 'Not Started';
                $assignee = $task->assignee ? $task->assignee->name : 'Unassigned';
                $context .= "- {$task->title} (Status: {$status}, Assignee: {$assignee})\n";
            }
        }

        return $context;
    }

    /**
     * Combines the project context with the user's prompt
     */
    private function buildPrompt(string $projectContext, string $userPrompt): string
    {
        return <<<PROMPT
        You are a helpful project management assistant. Below is the context of the project the user is asking about:

        $projectContext

        The user asks: "$userPrompt"

        Please provide a helpful, concise response based on the project information above. If the user's question is not related to the project data, politely indicate that you are designed to help with project-related queries.
        PROMPT;
    }
}