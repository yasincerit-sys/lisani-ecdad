<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
        'sinif_adi',
        'sinif_kodu',
        'birthdate',
        'total_score',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birthdate' => 'date',
            'total_score' => 'integer',
        ];
    }

    public function sinifAsHoca(): HasOne
    {
        return $this->hasOne(Sinif::class, 'hoca_id');
    }

    public function progress(): HasOne
    {
        return $this->hasOne(UserProgress::class);
    }

    public function toFrontendArray(bool $includePassword = false): array
    {
        $progress = $this->relationLoaded('progress')
            ? $this->progress
            : $this->progress()->first();

        $data = [
            'uid' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar ?? '🐱',
            'role' => $this->role ?? 'ogrenci',
            'sinif' => $this->sinif_adi ?: null,
            'sinifKodu' => $this->sinif_kodu ?: null,
            'birthdate' => $this->birthdate?->format('Y-m-d') ?? '',
            'totalScore' => $progress?->total_xp ?? $this->total_score ?? 0,
            'streakDays' => $progress?->streak_days ?? 0,
        ];

        if ($includePassword) {
            $data['password'] = '';
        }

        return $data;
    }
}
