<?php

namespace App\Support;

class LisaniApk
{
    public static function downloadUrl(): ?string
    {
        $custom = trim((string) config('lisani.apk.url', ''));
        if ($custom !== '') {
            return $custom;
        }

        $filename = (string) config('lisani.apk.filename', 'lisani-ecdad.apk');
        $path = public_path('downloads/'.$filename);

        if (! is_file($path)) {
            return null;
        }

        return asset('downloads/'.$filename);
    }

    public static function clientConfig(): array
    {
        return [
            'url' => self::downloadUrl(),
            'filename' => (string) config('lisani.apk.filename', 'lisani-ecdad.apk'),
        ];
    }
}
