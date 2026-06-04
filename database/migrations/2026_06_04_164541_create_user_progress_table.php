<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('total_xp')->default(0);
            $table->unsignedInteger('tests_count')->default(0);
            $table->unsignedTinyInteger('avg_success')->default(0);
            $table->timestamp('last_active_at')->nullable();
            $table->string('last_test_label')->nullable();
            $table->unsignedTinyInteger('last_test_percent')->nullable();
            $table->json('recent_tests')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
