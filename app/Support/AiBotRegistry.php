<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AiBotRegistry
{
    public const BOTS = [
        ['name' => 'Elif', 'email' => 'bot.elif@lisaniecdad.app', 'avatar' => '📜'],
        ['name' => 'Lügat', 'email' => 'bot.lugat@lisaniecdad.app', 'avatar' => '📖'],
        ['name' => 'Tercüme', 'email' => 'bot.tercume@lisaniecdad.app', 'avatar' => '🔄'],
        ['name' => 'Hikmet', 'email' => 'bot.hikmet@lisaniecdad.app', 'avatar' => '✨'],
    ];

    public static function ensureBotsExist(): void
    {
        $password = Hash::make(Str::random(32));

        foreach (self::BOTS as $bot) {
            User::updateOrCreate(
                ['email' => $bot['email']],
                [
                    'name' => $bot['name'],
                    'password' => $password,
                    'avatar' => $bot['avatar'],
                    'role' => 'bot',
                    'total_score' => 0,
                ]
            );
        }
    }
}
