<?php

namespace Database\Seeders;

use App\Models\Sinif;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $hoca = User::updateOrCreate(
            ['email' => 'hoca@lisaniecdad.app'],
            [
                'name' => 'Demo Hoca',
                'password' => 'hoca123',
                'avatar' => '📚',
                'role' => 'hoca',
                'sinif_adi' => 'Osmanlıca Başlangıç Grubu',
                'total_score' => 0,
            ]
        );

        Sinif::firstOrCreate(
            ['hoca_id' => $hoca->id],
            [
                'hoca_adi' => $hoca->name,
                'sinif_adi' => 'Osmanlıca Başlangıç Grubu',
                'kisa_kod' => 'DEMO01',
                'ogrenciler' => [],
                'odevler' => [],
            ]
        );

        $this->command?->info('Demo hoca oluşturuldu.');
        $this->command?->info('  Giriş: Demo Hoca / hoca123');
        $this->command?->info('  Sınıf kodu (öğrencilere verin): DEMO01');
    }
}
