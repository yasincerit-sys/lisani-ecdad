<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $user = User::where('email', 'kerem.ceri@lisaniecdad.app')->first();

        if ($user) {
            $user->update([
                'name' => 'Kerem Cerit',
                'email' => 'kerem.cerit@lisaniecdad.app',
            ]);

            return;
        }

        User::updateOrCreate(
            ['email' => 'kerem.cerit@lisaniecdad.app'],
            [
                'name' => 'Kerem Cerit',
                'password' => 'es26ma45',
                'avatar' => '👑',
                'role' => 'yonetici',
                'total_score' => 0,
            ]
        );
    }

    public function down(): void
    {
        $user = User::where('email', 'kerem.cerit@lisaniecdad.app')->first();

        if ($user) {
            $user->update([
                'name' => 'Kerem Ceri',
                'email' => 'kerem.ceri@lisaniecdad.app',
            ]);
        }
    }
};
