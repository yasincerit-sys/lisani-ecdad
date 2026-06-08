<?php

namespace App\Support\Bot;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BotAiClient
{
    public function isAvailable(): bool
    {
        $key = config('services.openai.api_key');

        return is_string($key) && $key !== '';
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    public function chat(array $messages, string $systemPrompt): ?string
    {
        if (! $this->isAvailable()) {
            return null;
        }

        $payload = [
            'model' => config('services.openai.model', 'gpt-4o-mini'),
            'messages' => array_merge(
                [['role' => 'system', 'content' => $systemPrompt]],
                $messages
            ),
            'max_tokens' => (int) config('services.openai.max_tokens', 500),
            'temperature' => (float) config('services.openai.temperature', 0.75),
        ];

        try {
            $response = Http::timeout((int) config('services.openai.timeout', 25))
                ->withToken(config('services.openai.api_key'))
                ->acceptJson()
                ->post(rtrim(config('services.openai.base_url', 'https://api.openai.com/v1'), '/').'/chat/completions', $payload);

            if (! $response->successful()) {
                Log::warning('Bot AI API hatası', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return null;
            }

            $content = $response->json('choices.0.message.content');

            return is_string($content) && trim($content) !== ''
                ? trim($content)
                : null;
        } catch (\Throwable $e) {
            Log::warning('Bot AI isteği başarısız: '.$e->getMessage());

            return null;
        }
    }
}
