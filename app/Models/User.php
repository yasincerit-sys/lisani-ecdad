<?php

namespace App\Models;

use App\Support\AvatarHelper;
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
        'total_score',
        'tennis_unlocked',
        'banned_at',
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
            'total_score' => 'integer',
            'tennis_unlocked' => 'boolean',
            'banned_at' => 'datetime',
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

    public function isBanned(): bool
    {
        return $this->banned_at !== null;
    }

    public function resolvedAvatar(): string
    {
        return AvatarHelper::resolve($this->avatar, $this->id);
    }

    public function toFrontendArray(bool $includePassword = false): array
    {
        $data = [
            'uid' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->resolvedAvatar(),
            'role' => $this->role ?? 'ogrenci',
            'sinif' => $this->sinif_adi ?: null,
            'sinifKodu' => $this->sinif_kodu ?: null,
            'totalScore' => $this->total_score ?? 0,
            'tennisUnlocked' => (bool) ($this->tennis_unlocked ?? false),
        ];

        if ($includePassword) {
            $data['password'] = '';
        }

        return $data;
    }
}
