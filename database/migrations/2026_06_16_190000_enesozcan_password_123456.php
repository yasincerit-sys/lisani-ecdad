<?php

use App\Models\User;
use App\Support\PresetHocaAccounts;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $password = '123456';

        User::query()
            ->whereRaw('LOWER(name) = ?', [Str::lower('enesözcan')])
            ->update([
                'password' => $password,
                'role' => 'hoca',
                'banned_at' => null,
            ]);

        PresetHocaAccounts::ensureAll();
    }

    public function down(): void
    {
        //
    }
};
