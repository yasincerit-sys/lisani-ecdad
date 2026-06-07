<?php

namespace Database\Seeders;

use App\Models\Sinif;
use App\Models\User;
use App\Support\AvatarHelper;
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
                'avatar' => AvatarHelper::besiktasHtml(),
                'role' => 'hoca',
                'sinif_adi' => 'Osmanlıca Başlangıç Grubu',
                'total_score' => 0,
            ]
        );

        $sinif = Sinif::firstOrCreate(
            ['hoca_id' => $hoca->id],
            [
                'hoca_adi' => $hoca->name,
                'sinif_adi' => 'Osmanlıca Başlangıç Grubu',
                'kisa_kod' => 'DEMO01',
                'ogrenciler' => [],
                'odevler' => [],
            ]
        );

        $ogrenci = User::updateOrCreate(
            ['email' => 'ogrenci@lisaniecdad.app'],
            [
                'name' => 'Demo Öğrenci',
                'password' => 'ogrenci123',
                'avatar' => AvatarHelper::besiktasHtml(),
                'role' => 'ogrenci',
                'total_score' => 120,
            ]
        );
        $sinif->addOgrenci($ogrenci);

        User::updateOrCreate(
            ['email' => 'kerem.cerit@lisaniecdad.app'],
            [
                'name' => 'Kerem Cerit',
                'password' => 'es26ma45',
                'avatar' => AvatarHelper::besiktasHtml(),
                'role' => 'yonetici',
                'total_score' => 0,
            ]
        );

        $this->command?->info('Demo hoca oluşturuldu.');
        $this->command?->info('  Giriş: Demo Hoca / hoca123');
        $this->command?->info('  Sınıf kodu (öğrencilere verin): DEMO01');
        $this->command?->info('Demo öğrenci: Demo Öğrenci / ogrenci123 (DEMO01 sınıfında)');
        $this->command?->info('Uygulama yöneticisi: Kerem Cerit / es26ma45');
    }
}
