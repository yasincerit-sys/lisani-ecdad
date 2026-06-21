<?php

use App\Models\User;
use App\Support\PresetHocaAccounts;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        User::updateOrCreate(
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

        User::where('role', 'yonetici')
            ->whereRaw('LOWER(name) IN (?, ?, ?)', ['kerem cerit', 'kerem ceri', 'yönetici'])
            ->update(['name' => 'keremcerit']);

        PresetHocaAccounts::ensureAll();
    }

    public function down(): void
    {
        // Hesapları silmeyiz — geri alma güvenli değil.
    }
};
