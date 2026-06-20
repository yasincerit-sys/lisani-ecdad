<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AvatarHelper
{
    public const BESIKTAS_FILE = 'besiktas.svg';

    public const MAX_PHOTO_BYTES = 2_097_152;

    public static function teamPath(string $file): string
    {
        return '/images/avatars/'.ltrim($file, '/');
    }

    public static function teamHtml(string $file): string
    {
        $src = self::teamPath($file);

        return '<span class="avatar-glass-emblem"><img src="'.$src.'" alt="" /></span>';
    }

    public static function besiktasHtml(): string
    {
        return self::teamHtml(self::BESIKTAS_FILE);
    }

    public static function defaultHtml(): string
    {
        return self::besiktasHtml();
    }

    public static function defaultStorageKey(): string
    {
        return 'team:'.self::BESIKTAS_FILE;
    }

    public static function isTeamAvatar(?string $avatar): bool
    {
        if (! $avatar) {
            return false;
        }

        return str_starts_with($avatar, 'team:')
            || str_contains($avatar, 'avatar-glass-emblem')
            || str_contains($avatar, '/images/avatars/')
            || str_contains($avatar, 'avatars/');
    }

    public static function isCustomPhotoAvatar(?string $avatar): bool
    {
        if (! $avatar || self::isTeamAvatar($avatar)) {
            return false;
        }

        return str_starts_with($avatar, 'photo:')
            || (str_contains($avatar, '<img') && str_contains($avatar, 'lisani-avatar-img'));
    }

    public static function isLegacyAvatar(?string $avatar): bool
    {
        if (! $avatar || self::isTeamAvatar($avatar) || self::isCustomPhotoAvatar($avatar)) {
            return false;
        }

        return str_contains($avatar, 'istanbul/')
            || str_contains($avatar, '🐱')
            || str_contains($avatar, '🎒')
            || mb_strlen($avatar) <= 8;
    }

    public static function persistForStorage(?string $avatar, User $user): string
    {
        if (! $avatar || trim($avatar) === '') {
            return self::defaultStorageKey();
        }

        if (str_starts_with($avatar, 'team:') || str_starts_with($avatar, 'photo:')) {
            return $avatar;
        }

        if (preg_match('#avatars/([^"?]+\.svg)#i', $avatar, $match)) {
            return 'team:'.$match[1];
        }

        if (preg_match('#src="(data:image/[^"]+)"#i', $avatar, $match)) {
            return self::storeDataUri($match[1], $user);
        }

        if (str_starts_with($avatar, 'data:image/')) {
            return self::storeDataUri($avatar, $user);
        }

        if (preg_match('#src="([^"]+)"#i', $avatar, $match)) {
            $relative = self::extractStorageRelative($match[1]);
            if ($relative) {
                return 'photo:'.$relative;
            }
        }

        if (! str_contains($avatar, '<') && mb_strlen($avatar) <= 8) {
            return self::defaultStorageKey();
        }

        if (mb_strlen($avatar) <= 500) {
            return $avatar;
        }

        throw ValidationException::withMessages([
            'avatar' => ['Profil görseli kaydedilemedi. Daha küçük bir fotoğraf deneyin.'],
        ]);
    }

    public static function storeDataUri(string $dataUri, User $user): string
    {
        if (! preg_match('#^data:image/(png|jpe?g|webp|gif);base64,(.+)$#i', $dataUri, $match)) {
            throw ValidationException::withMessages([
                'avatar' => ['Geçersiz görsel formatı.'],
            ]);
        }

        $ext = strtolower($match[1]) === 'jpeg' ? 'jpg' : strtolower($match[1]);
        $binary = base64_decode($match[2], true);

        if ($binary === false) {
            throw ValidationException::withMessages([
                'avatar' => ['Görsel okunamadı.'],
            ]);
        }

        if (strlen($binary) > self::MAX_PHOTO_BYTES) {
            throw ValidationException::withMessages([
                'avatar' => ['Görsel çok büyük (en fazla 2 MB).'],
            ]);
        }

        self::deleteStoredPhoto($user->avatar);

        $name = 'u'.$user->id.'_'.substr(sha1($binary), 0, 12).'.'.$ext;
        $path = 'avatars/'.$name;
        Storage::disk('public')->put($path, $binary);

        return 'photo:'.$path;
    }

    public static function deleteStoredPhoto(?string $avatar): void
    {
        if (! $avatar || ! str_starts_with($avatar, 'photo:')) {
            return;
        }

        Storage::disk('public')->delete(substr($avatar, 6));
    }

    public static function extractStorageRelative(string $url): ?string
    {
        if (preg_match('#/storage/(avatars/[^"?]+)#i', $url, $match)) {
            return $match[1];
        }

        return null;
    }

    public static function resolve(?string $avatar, ?int $userId = null): string
    {
        if ($avatar && str_starts_with($avatar, 'team:')) {
            return self::teamHtml(substr($avatar, 5));
        }

        if ($avatar && str_starts_with($avatar, 'photo:')) {
            $url = asset('storage/'.substr($avatar, 6));

            return '<img src="'.$url.'" class="lisani-avatar-img" alt="" />';
        }

        if (self::isTeamAvatar($avatar)) {
            if ($avatar && str_contains($avatar, 'avatar-glass-emblem')) {
                return $avatar;
            }

            if (preg_match('#avatars/(.+\.svg)#i', $avatar ?? '', $match)) {
                return self::teamHtml($match[1]);
            }
        }

        if (self::isCustomPhotoAvatar($avatar)) {
            return $avatar;
        }

        return self::defaultHtml();
    }
}
