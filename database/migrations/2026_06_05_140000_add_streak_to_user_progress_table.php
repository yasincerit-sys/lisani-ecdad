<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            $table->unsignedSmallInteger('streak_days')->default(0)->after('avg_success');
            $table->date('last_streak_date')->nullable()->after('streak_days');
        });
    }

    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            $table->dropColumn(['streak_days', 'last_streak_date']);
        });
    }
};
