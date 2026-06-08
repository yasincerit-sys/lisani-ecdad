<?php

namespace App\Support;

use App\Models\Sinif;
use App\Models\User;

class HocaClassRegistry
{
    public const CLASSES = [
        [
            'hoca_email' => 'hoca.ahmet@lisaniecdad.app',
            'hoca_name' => 'Hoca Ahmet',
            'hoca_password' => 'hoca123',
            'avatar_file' => 'istanbul/ulucami.svg',
            'sinif_adi' => 'Osmanlıca I. Grup',
            'kisa_kod' => 'ECDAD1',
        ],
        [
            'hoca_email' => 'hoca.ayse@lisaniecdad.app',
            'hoca_name' => 'Hoca Ayşe',
            'hoca_password' => 'hoca123',
            'avatar_file' => 'istanbul/ayasofya.svg',
            'sinif_adi' => 'Osmanlıca II. Grup',
            'kisa_kod' => 'ECDAD2',
        ],
        [
            'hoca_email' => 'hoca.mehmet@lisaniecdad.app',
            'hoca_name' => 'Hoca Mehmet',
            'hoca_password' => 'hoca123',
            'avatar_file' => 'istanbul/galata.svg',
            'sinif_adi' => 'Osmanlıca III. Grup',
            'kisa_kod' => 'ECDAD3',
        ],
        [
            'hoca_email' => 'hoca.fatma@lisaniecdad.app',
            'hoca_name' => 'Hoca Fatma',
            'hoca_password' => 'hoca123',
            'avatar_file' => 'istanbul/kiz-kulesi.svg',
            'sinif_adi' => 'Osmanlıca IV. Grup',
            'kisa_kod' => 'ECDAD4',
        ],
        [
            'hoca_email' => 'hoca.ali@lisaniecdad.app',
            'hoca_name' => 'Hoca Ali',
            'hoca_password' => 'hoca123',
            'avatar_file' => 'istanbul/camii.svg',
            'sinif_adi' => 'Osmanlıca V. Grup',
            'kisa_kod' => 'ECDAD5',
        ],
    ];

    public static function kisaKodlar(): array
    {
        return array_column(self::CLASSES, 'kisa_kod');
    }

    /**
     * @return array<int, Sinif>
     */
    public static function ensureAll(): array
    {
        $sinifs = [];

        foreach (self::CLASSES as $config) {
            $hoca = User::updateOrCreate(
                ['email' => $config['hoca_email']],
                [
                    'name' => $config['hoca_name'],
                    'password' => $config['hoca_password'],
                    'avatar' => AvatarHelper::teamHtml($config['avatar_file']),
                    'role' => 'hoca',
                    'sinif_adi' => $config['sinif_adi'],
                    'total_score' => 0,
                ]
            );

            $sinif = Sinif::firstOrCreate(
                ['hoca_id' => $hoca->id],
                [
                    'hoca_adi' => $hoca->name,
                    'sinif_adi' => $config['sinif_adi'],
                    'kisa_kod' => $config['kisa_kod'],
                    'ogrenciler' => [],
                    'odevler' => [],
                ]
            );

            if ($sinif->kisa_kod !== $config['kisa_kod']) {
                $sinif->kisa_kod = $config['kisa_kod'];
            }
            if ($sinif->sinif_adi !== $config['sinif_adi']) {
                $sinif->sinif_adi = $config['sinif_adi'];
            }
            if ($sinif->hoca_adi !== $hoca->name) {
                $sinif->hoca_adi = $hoca->name;
            }
            $sinif->save();

            $hoca->sinif_adi = $config['sinif_adi'];
            $hoca->save();

            $sinifs[] = $sinif->fresh();
        }

        return $sinifs;
    }
}
