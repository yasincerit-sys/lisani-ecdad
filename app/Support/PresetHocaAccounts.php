<?php

namespace App\Support;

use App\Models\Sinif;
use App\Models\User;
use Illuminate\Support\Str;

class PresetHocaAccounts
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public static function definitions(): array
    {
        $accounts = config('hoca_accounts.accounts', []);

        return is_array($accounts) ? $accounts : [];
    }

    /**
     * @return array<int, Sinif>
     */
    public static function ensureAll(): array
    {
        $sinifs = [];

        foreach (self::definitions() as $config) {
            $name = trim((string) ($config['name'] ?? ''));
            $password = (string) ($config['password'] ?? '');

            if ($name === '' || $password === '') {
                continue;
            }

            $email = trim((string) ($config['email'] ?? ''));
            if ($email === '') {
                $email = self::emailFromName($name);
            }

            $sinifAdi = trim((string) ($config['sinif_adi'] ?? ''));
            if ($sinifAdi === '') {
                $sinifAdi = $name.' Sınıfı';
            }

            $avatarFile = (string) ($config['avatar_file'] ?? 'istanbul/ulucami.svg');

            $hoca = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => $password,
                    'avatar' => AvatarHelper::teamHtml($avatarFile),
                    'role' => 'hoca',
                    'sinif_adi' => $sinifAdi,
                    'total_score' => 0,
                ]
            );

            // Giriş adı veya e-posta config'te değiştiyse güncelle
            if ($hoca->name !== $name) {
                $hoca->name = $name;
            }
            $hoca->password = $password;
            $hoca->role = 'hoca';
            $hoca->sinif_adi = $sinifAdi;
            $hoca->save();

            $kisaKod = strtoupper(trim((string) ($config['kisa_kod'] ?? '')));
            if ($kisaKod === '') {
                $kisaKod = Sinif::generateKisaKod();
            }

            $sinif = Sinif::firstOrCreate(
                ['hoca_id' => $hoca->id],
                [
                    'hoca_adi' => $hoca->name,
                    'sinif_adi' => $sinifAdi,
                    'kisa_kod' => $kisaKod,
                    'ogrenciler' => [],
                    'odevler' => [],
                ]
            );

            $sinif->hoca_adi = $hoca->name;
            $sinif->sinif_adi = $sinifAdi;
            $sinif->kisa_kod = $kisaKod;
            $sinif->save();

            $sinifs[] = $sinif->fresh();
        }

        return $sinifs;
    }

    public static function emailFromName(string $name): string
    {
        $slug = Str::slug(Str::lower($name), '');
        $slug = substr(preg_replace('/[^a-z0-9]/', '', $slug) ?: 'hoca', 0, 24);

        $email = $slug.'@lisaniecdad.app';
        $n = 0;

        while (User::where('email', $email)->whereRaw('LOWER(name) != ?', [Str::lower($name)])->exists()) {
            $n++;
            $email = $slug.$n.'@lisaniecdad.app';
        }

        return $email;
    }
}
