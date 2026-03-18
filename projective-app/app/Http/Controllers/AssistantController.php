<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;

class AssistantController extends Controller
{

    private function maskSensitiveData($text) {
        $text = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/', '[email]', $text);
        $text = preg_replace('/\\b\\d{10,}\\b/', '[phone]', $text);
        return $text;
    }
public function query(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
            'boardData' => 'nullable|string',
        ]);

        $prompt = $request->input('prompt');
        $boardData = $request->input('boardData');

      
        $user = Auth::user();
        $dbTasksContext = "";

        if ($user) {
            
            $tasks = \App\Models\Task::with('project')
                        ->where('assignee_id', $user->id) 
                        ->whereIn('status', ['in progress', 'In Progress', 'in_progress', 'doing']) 
                        ->get();

            if ($tasks->count() > 0) {
                $dbTasksContext = "Here is the list of tasks currently 'in progress' assigned to the user:\n";
                foreach ($tasks as $task) {
                    $projectName = $task->project ? $task->project->name : 'Independent Task';
                    $dueDate = $task->due_date ? $task->due_date->format('Y-m-d') : 'No specific due date';
                    
                    $dbTasksContext .= "- Task Title: {$task->title}\n";
                    $dbTasksContext .= "  Project: {$projectName}\n";
                    $dbTasksContext .= "  Status: {$task->status}\n";
                    $dbTasksContext .= "  Due Date: {$dueDate}\n";
                    $dbTasksContext .= "  Description: {$task->description}\n\n";
                }
            } else {
                $dbTasksContext = "The user currently has no tasks in progress.\n";
            }
        } else {
            $dbTasksContext = "User is not authenticated. Cannot fetch database tasks.\n";
        }

        $combinedPrompt = "You are a helpful project management assistant for this system. Use the following context to answer the user's question accurately.\n\n" .
                          "System/Board Context:\n" . $boardData . "\n\n" . 
                          "User's Database Context:\n" . $dbTasksContext . "\n\n" . 
                          "User Question: " . $prompt;

        $maskedPrompt = $this->maskSensitiveData($combinedPrompt);
        
     
        $aiResponse = $this->callGroqApi($maskedPrompt);

        return response()->json([
            'answer' => $aiResponse,
        ]);
    }

    
    private function callGroqApi($prompt)
    {
        
        $apiKey =env("GROK_API_KEY"); 

        $url = "https://api.groq.com/openai/v1/chat/completions";

        try {
            $response = Http::withToken($apiKey) 
                ->timeout(30)
                ->withOptions([
                    'verify' => false, 
                ])->post($url, [
                    "model" => "llama-3.1-8b-instant",
                    "messages" => [
                        [
                            "role" => "system",
                            "content" => "You are a helpful project management assistant."
                        ],
                        [
                            "role" => "user",
                            "content" => $prompt
                        ]
                    ],
                    "temperature" => 0.3,
                    "max_tokens" => 1000,
                ]);

            if ($response->failed()) {
               
                return "Groq Error Details: " . $response->body();
            }

            $responseData = $response->json();
            
            
            return $responseData["choices"][0]["message"]["content"] ?? "No response generated.";

        } catch (\Exception $e) {
            Log::error('Groq API error: ' . $e->getMessage());
            return "Error: " . $e->getMessage();
        }
    }
}