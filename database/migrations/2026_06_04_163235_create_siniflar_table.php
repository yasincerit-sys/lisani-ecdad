<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siniflar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hoca_id')->constrained('users')->cascadeOnDelete();
            $table->string('hoca_adi');
            $table->string('sinif_adi');
            $table->string('kisa_kod', 20)->unique();
            $table->json('ogrenciler')->nullable();
            $table->json('odevler')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siniflar');
    }
};
