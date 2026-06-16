<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Lisani kill switch (web + APK)
    |--------------------------------------------------------------------------
    |
    | true veya storage/app/LISANI_DOWN dosyası varken uygulama açılmaz.
    | APP_ENV=local veya localhost istekleri kill_switch_allow_local ile muaf tutulur.
    | Geri açmak için: LISANI_KILL_SWITCH=false yap ve LISANI_DOWN dosyasını sil.
    |
    */
    'kill_switch' => env('LISANI_KILL_SWITCH', false),

    'kill_switch_allow_local' => env('LISANI_KILL_SWITCH_ALLOW_LOCAL', true),

    /*
    |--------------------------------------------------------------------------
    | Destek / bağış (Ayarlar → Bize destek olmak ister misiniz?)
    |--------------------------------------------------------------------------
    |
    | LISANI_DONATE_URL: PayPal.me veya Stripe Ödeme Linki (https://...)
    | LISANI_DONATE_PAYPAL_ME=true ise URL sonuna /TUTAR eklenir (serbest tutar için önerilir)
    | LISANI_DONATE_IBAN: Havale için (isteğe bağlı)
    |
    */
    'donate' => [
        'url' => env('LISANI_DONATE_URL', ''),
        'paypal_me' => filter_var(env('LISANI_DONATE_PAYPAL_ME', false), FILTER_VALIDATE_BOOLEAN),
        'iban' => env('LISANI_DONATE_IBAN', ''),
        'account_name' => env('LISANI_DONATE_ACCOUNT_NAME', 'Lisan-ı Ecdad'),
    ],

];
