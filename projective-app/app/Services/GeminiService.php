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
        
        $this->apiKey = env("GROK_API_KEY");
        $this->baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    }

    public function getResponse(string $prompt): string
    {
        if (!$this->apiKey) {
            return "AI service is not configured. Please contact your administrator.";
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->baseUrl, [
                    "model" => "llama3-8b-8192", 
                    "messages" => [
                        [
                            "role" => "system",
                            "content" => "You are a helpful assistant."
                        ],
                        [
                            "role" => "user",
                            "content" => $prompt
                        ]
                    ],
                    "temperature" => 0.3,
                ]);

            if ($response->failed()) {
                Log::error("Groq API failed", [
                    "status" => $response->status(),
                    "body" => $response->body()
                ]);
                return "API Error: " . $response->body(); 
            }

            $responseData = $response->json();
            return $responseData["choices"][0]["message"]["content"] ?? 
                   "I could not generate a response at this time.";

        } catch (\Exception $e) {
            Log::error("GroqService error: " . $e->getMessage());
            return "Error: " . $e->getMessage();
        }
    }
}