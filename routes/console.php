<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('lisani:sync-hoca-accounts', function () {
    $sinifs = \App\Support\PresetHocaAccounts::ensureAll();

    if ($sinifs === []) {
        $this->warn('config/hoca_accounts.php içinde tanımlı hoca yok.');

        return 0;
    }

    $this->info('Hoca hesapları güncellendi:');
    foreach ($sinifs as $sinif) {
        $hoca = $sinif->hoca;
        $cfg = collect(\App\Support\PresetHocaAccounts::definitions())->first(
            fn ($a) => strcasecmp(trim((string) ($a['name'] ?? '')), (string) $hoca?->name) === 0
        );
        $pass = (string) ($cfg['password'] ?? '—');
        $this->line("  • Giriş: {$hoca?->name} / {$pass}");
        $this->line("    Sınıf kodu (öğrencilere): {$sinif->kisa_kod} — {$sinif->sinif_adi}");
    }

    return 0;
})->purpose('config/hoca_accounts.php dosyasındaki hoca hesaplarını veritabanına yazar');
