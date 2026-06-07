<?php

use App\Support\AiBotRegistry;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        AiBotRegistry::ensureBotsExist();
    }

    public function down(): void
    {
        \App\Models\User::whereIn('email', array_column(AiBotRegistry::BOTS, 'email'))->delete();
    }
};
