<?php

use App\Models\User;
use App\Support\AiBotRegistry;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        User::whereIn('email', AiBotRegistry::emails())
            ->orWhere('role', 'bot')
            ->update(['role' => 'ogrenci']);

        AiBotRegistry::ensureBotsExist();
    }

    public function down(): void
    {
        User::whereIn('email', AiBotRegistry::emails())->update(['role' => 'bot']);
    }
};
