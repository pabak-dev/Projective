<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http; // Add this for making API calls

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

            // 1. Load the project data
            $project = Project::with('tasks.assignedUser')->findOrFail($projectId);

            // 2. Prepare a context for the AI using the project data
            $projectContext = $this->prepareProjectContext($project);

            // 3. Combine the context with the user's prompt
            $fullPrompt = $this->buildPrompt($projectContext, $userPrompt);

            // 4. Make the request to the Google Gemini API
            $aiResponse = $this->callGeminiApi($fullPrompt);

            // 5. Return the AI's response
            return response()->json([
                'answer' => $aiResponse,
                'tasks' => $project->tasks, // You can still send tasks if your frontend needs them
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
                $assignee = $task->assignedUser ? $task->assignedUser->name : 'Unassigned';
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

    /**
     * Makes the actual request to the Google Gemini API
     */
    private function callGeminiApi(string $prompt): string
    {
        // Get your API key from the .env file
        $apiKey = env('GEMINI_API_KEY');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}";

        // Make the POST request
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        // Check for HTTP errors
        if ($response->failed()) {
            Log::error('Gemini API request failed: ' . $response->body());
            throw new \Exception('Failed to get response from AI service.');
        }

        $responseData = $response->json();

        // Extract the AI's text response from the JSON structure
        return $responseData['candidates'][0]['content']['parts'][0]['text'] ?? 'Sorry, I could not generate a response.';
    }
}