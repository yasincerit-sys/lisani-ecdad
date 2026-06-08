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
        // Bot kayıtları korunur; geri alma gerekmez.
    }
};
