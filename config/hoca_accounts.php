<?php

/**
 * Önceden tanımlı hoca hesapları.
 *
 * Giriş: "name" alanı (büyük/küçük harf fark etmez) + password
 * Öğrenciler sınıfa "kisa_kod" ile katılır.
 *
 * Yeni hoca eklemek için accounts dizisine satır ekleyin, ardından:
 *   php artisan lisani:sync-hoca-accounts
 */
return [

    'accounts' => [

        [
            'name' => 'enesözcan',
            'password' => '123456',
            'sinif_adi' => 'Enes Özcan Sınıfı',
            'kisa_kod' => 'ENES01',
            // 'email' => 'enes.ozcan@lisaniecdad.app', // isteğe bağlı
            // 'avatar_file' => 'istanbul/ulucami.svg',
        ],

        // Örnek — yeni hoca:
        // [
        //     'name' => 'aysehoca',
        //     'password' => '123456',
        //     'sinif_adi' => 'Ayşe Hoca Sınıfı',
        //     'kisa_kod' => 'AYSE01',
        // ],

    ],

];
