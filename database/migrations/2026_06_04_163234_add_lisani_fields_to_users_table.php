<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar', 500)->default('🐱')->after('password');
            $table->string('role', 20)->default('ogrenci')->after('avatar');
            $table->string('sinif_adi')->nullable()->after('role');
            $table->string('sinif_kodu', 20)->nullable()->after('sinif_adi');
            $table->date('birthdate')->nullable()->after('sinif_kodu');
            $table->unsignedInteger('total_score')->default(0)->after('birthdate');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->dropColumn([
                'avatar',
                'role',
                'sinif_adi',
                'sinif_kodu',
                'birthdate',
                'total_score',
            ]);
        });
    }
};
