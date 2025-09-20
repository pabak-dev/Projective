<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = env("GEMINI_API_KEY");
        $this->baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    }

    public function getResponse(string $prompt): string
    {
        if (!$this->apiKey) {
            return "AI service is not configured. Please contact your administrator.";
        }

        try {
            $response = Http::timeout(30)->post($this->baseUrl . "?key=" . $this->apiKey, [
                "contents" => [
                    [
                        "parts" => [
                            ["text" => $prompt]
                        ]
                    ]
                ],
                "generationConfig" => [
                    "temperature" => 0.3,
                    "topP" => 0.8,
                    "maxOutputTokens" => 1000,
                ]
            ]);

            if ($response->failed()) {
                Log::error("Gemini API failed", [
                    "status" => $response->status(),
                    "body" => $response->body()
                ]);
                return "I apologize, but the AI service is currently unavailable. Please try again later.";
            }

            $responseData = $response->json();

            return $responseData["candidates"][0]["content"]["parts"][0]["text"] ?? 
                   "I could not generate a response at this time.";

        } catch (\Exception $e) {
            Log::error("GeminiService error: " . $e->getMessage());
            return "I encountered an error while processing your request. Please try again.";
        }
    }
}
