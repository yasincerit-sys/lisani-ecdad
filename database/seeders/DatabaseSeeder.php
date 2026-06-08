<?php

namespace Database\Seeders;

use App\Models\Sinif;
use App\Models\User;
use App\Support\AiBotRegistry;
use App\Support\AvatarHelper;
use App\Support\HocaClassRegistry;
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
                'avatar' => AvatarHelper::teamHtml('istanbul/ulucami.svg'),
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
                'avatar' => AvatarHelper::teamHtml('besiktas.svg'),
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
                'avatar' => AvatarHelper::teamHtml('saray-kavvesi.svg'),
                'role' => 'yonetici',
                'total_score' => 0,
            ]
        );

        AiBotRegistry::ensureBotsExist();

        $this->command?->info('Demo hoca oluşturuldu.');
        $this->command?->info('  Giriş: Demo Hoca / hoca123');
        $this->command?->info('  Sınıf kodu (öğrencilere verin): DEMO01');
        $this->command?->info('Demo öğrenci: Demo Öğrenci / ogrenci123 (DEMO01 sınıfında)');
        $this->command?->info('Uygulama yöneticisi: Kerem Cerit / es26ma45');
        $this->command?->info('');
        $this->command?->info('5 hoca sınıfı (botlar bölünmüş):');
        foreach (HocaClassRegistry::CLASSES as $cfg) {
            $this->command?->info("  {$cfg['hoca_name']} / hoca123 — {$cfg['kisa_kod']} ({$cfg['sinif_adi']})");
        }
        $this->command?->info('  16 yapay zeka botu ECDAD1–ECDAD5 arasında dağıtıldı.');
    }
}
