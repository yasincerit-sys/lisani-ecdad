<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tennis_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('code', 8)->unique();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('waiting');
            $table->float('host_paddle_x')->default(124);
            $table->float('guest_paddle_x')->default(124);
            $table->json('game_state');
            $table->timestamp('host_last_seen')->nullable();
            $table->timestamp('guest_last_seen')->nullable();
            $table->timestamps();

            $table->index(['status', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tennis_rooms');
    }
};
