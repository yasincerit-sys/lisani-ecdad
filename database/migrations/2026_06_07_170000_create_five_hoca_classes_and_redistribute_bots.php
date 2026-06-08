<?php

use App\Support\AiBotRegistry;
use App\Support\HocaClassRegistry;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        HocaClassRegistry::ensureAll();
        AiBotRegistry::ensureBotsExist();
    }

    public function down(): void
    {
        // Geri alma: botları DEMO01'e taşımak güvenli değil; no-op.
    }
};
