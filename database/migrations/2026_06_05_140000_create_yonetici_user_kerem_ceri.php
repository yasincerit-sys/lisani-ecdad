<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        User::updateOrCreate(
            ['email' => 'kerem.cerit@lisaniecdad.app'],
            [
                'name' => 'Kerem Cerit',
                'password' => Hash::make('es26ma45'),
                'avatar' => '👑',
                'role' => 'yonetici',
                'total_score' => 0,
            ]
        );
    }

    public function down(): void
    {
        User::whereIn('email', ['kerem.ceri@lisaniecdad.app', 'kerem.cerit@lisaniecdad.app'])->delete();
    }
};
