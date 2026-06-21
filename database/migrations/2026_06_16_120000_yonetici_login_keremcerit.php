<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        User::where('role', 'yonetici')
            ->where(function ($q) {
                $q->where('email', 'kerem.cerit@lisaniecdad.app')
                    ->orWhere('email', 'kerem.ceri@lisaniecdad.app')
                    ->orWhereRaw('LOWER(name) IN (?, ?)', ['kerem cerit', 'kerem ceri']);
            })
            ->update(['name' => 'keremcerit']);
    }

    public function down(): void
    {
        User::where('email', 'kerem.cerit@lisaniecdad.app')
            ->where('role', 'yonetici')
            ->update(['name' => 'Kerem Cerit']);
    }
};
