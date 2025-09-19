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
    // Mask sensitive data (emails, phone numbers, etc.) before sending to Gemini
    private function maskSensitiveData($text) {
        // Mask emails
        $text = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/', '[email]', $text);
        // Mask phone numbers (simple pattern: 10+ digits)
        $text = preg_replace('/\\b\\d{10,}\\b/', '[phone]', $text);
        // You can add more masking rules here (names, addresses, etc.)
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

        // Combine board data with prompt if provided
        if ($boardData) {
            $combinedPrompt = "Here is the board/page data for context:\n" . $boardData . "\nUser question: " . $prompt;
        } else {
            $combinedPrompt = $prompt;
        }

        $maskedPrompt = $this->maskSensitiveData($combinedPrompt);
        $aiResponse = $this->callGeminiApi($maskedPrompt);

        return response()->json([
            'answer' => $aiResponse,
        ]);
    }

    // Removed project/user context methods for simplicity

    private function callGeminiApi($prompt)
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return [
                'error' => true,
                'message' => 'AI service is not configured. Please contact your administrator.'
            ];
        }

    // Use the gemini-1.5-flash model
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}";

        try {
            $response = Http::timeout(30)->withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->post($url, [
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
                return [
                    'error' => true,
                    'message' => 'AI service unavailable',
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => $url,
                    'model' => 'gemini-1.0-pro',
                    'apiKeyStartsWith' => substr($apiKey, 0, 8)
                ];
            }

            $responseData = $response->json();
            return $responseData['candidates'][0]['content']['parts'][0]['text'] ?? [
                'error' => true,
                'message' => 'No response from Gemini API',
                'raw' => $responseData
            ];
        } catch (\Exception $e) {
            Log::error('GeminiService error: ' . $e->getMessage());
            return [
                'error' => true,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ];
        }
    }
}