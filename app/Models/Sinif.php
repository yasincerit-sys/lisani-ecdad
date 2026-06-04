<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

class Sinif extends Model
{
    protected $table = 'siniflar';

    protected $fillable = [
        'hoca_id',
        'hoca_adi',
        'sinif_adi',
        'kisa_kod',
        'ogrenciler',
        'odevler',
    ];

    protected function casts(): array
    {
        return [
            'ogrenciler' => 'array',
            'odevler' => 'array',
        ];
    }

    public function hoca(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hoca_id');
    }

    public static function generateKisaKod(): string
    {
        do {
            $kod = strtoupper(substr(str_shuffle('abcdefghijklmnopqrstuvwxyz'), 0, 3))
                . random_int(100, 999);
        } while (self::where('kisa_kod', $kod)->exists());

        return $kod;
    }

    public static function findByKod(string $kisaKod): ?self
    {
        return self::where('kisa_kod', strtoupper(trim($kisaKod)))->first();
    }

    public function addOgrenci(User $user): void
    {
        $ogrenciler = $this->ogrenciler ?? [];
        $uid = (string) $user->id;

        if (! in_array($uid, $ogrenciler, true)) {
            $ogrenciler[] = $uid;
            $this->ogrenciler = $ogrenciler;
            $this->save();
        }

        $user->sinif_kodu = $this->kisa_kod;
        $user->sinif_adi = $this->sinif_adi;
        $user->save();
    }

    public static function joinUser(User $user, string $kisaKod): self
    {
        if ($user->role !== 'ogrenci') {
            throw ValidationException::withMessages([
                'sinif_kodu' => ['Sınıfa sadece öğrenciler katılabilir.'],
            ]);
        }

        $sinif = self::findByKod($kisaKod);

        if (! $sinif) {
            throw ValidationException::withMessages([
                'sinif_kodu' => ['Bu sınıf kodu bulunamadı.'],
            ]);
        }

        $sinif->addOgrenci($user);

        return $sinif->fresh();
    }
}
