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
    | Android APK indirme (web sitesi)
    |--------------------------------------------------------------------------
    |
    | LISANI_APK_URL boşsa public/downloads/lisani-ecdad.apk dosyası aranır.
    | Derleme: npm run android:publish
    |
    */
    'apk' => [
        'url' => env('LISANI_APK_URL', ''),
        'filename' => env('LISANI_APK_FILENAME', 'lisani-ecdad.apk'),
    ],

];
