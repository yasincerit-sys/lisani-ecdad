<?php

namespace App\Support;

use App\Models\User;
use App\Support\Bot\BotAiClient;
use App\Support\Bot\BotLocalBrain;
use App\Support\Bot\BotPersonas;

class BotReplyService
{
    public function __construct(
        private BotAiClient $aiClient,
        private BotLocalBrain $localBrain,
    ) {}

    public function reply(User $bot, string $userMessage, User $human): string
    {
        $message = trim($userMessage);
        if ($message === '') {
            return 'Mesajını aldım ama boş görünüyor. Bir şey yazarsan yardımcı olurum 👋';
        }

        $history = BotLocalBrain::loadHistory($bot, $human);

        if ($this->aiClient->isAvailable()) {
            $llmMessages = $this->localBrain->formatHistoryForLlm($history, $message, $bot->name ?: 'Öğrenci');
            $aiReply = $this->aiClient->chat(
                $llmMessages,
                BotPersonas::systemPrompt($bot, $human)
            );

            if ($aiReply !== null) {
                return mb_strimwidth($aiReply, 0, 2000, '…');
            }
        }

        return mb_strimwidth(
            $this->localBrain->reply($bot, $human, $message, $history),
            0,
            2000,
            '…'
        );
    }
}
