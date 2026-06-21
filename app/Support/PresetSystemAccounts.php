<?php

namespace App\Support;

use App\Models\User;

class PresetSystemAccounts
{
    public static function ensureYonetici(): User
    {
        return User::updateOrCreate(
            ['email' => 'kerem.cerit@lisaniecdad.app'],
            [
                'name' => 'keremcerit',
                'password' => 'es26ma45',
                'avatar' => 'team:saray-kavvesi.svg',
                'role' => 'yonetici',
                'total_score' => 0,
                'banned_at' => null,
            ]
        );
    }

    public static function ensureAll(): void
    {
        self::ensureYonetici();
        PresetHocaAccounts::ensureAll();
    }
}
