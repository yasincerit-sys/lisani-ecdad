<?php

namespace App\Support;

class AvatarHelper
{
    public const BESIKTAS_FILE = 'besiktas.svg';

    public static function teamPath(string $file = self::BESIKTAS_FILE): string
    {
        return '/images/avatars/'.$file;
    }

    public static function besiktasHtml(): string
    {
        $src = self::teamPath(self::BESIKTAS_FILE);

        return '<span class="avatar-glass-emblem"><img src="'.$src.'" alt="" /></span>';
    }

    public static function defaultHtml(): string
    {
        return self::besiktasHtml();
    }

    public static function isTeamAvatar(?string $avatar): bool
    {
        if (! $avatar) {
            return false;
        }

        return str_contains($avatar, 'avatar-glass-emblem') || str_contains($avatar, 'avatars/besiktas');
    }

    public static function isCustomPhotoAvatar(?string $avatar): bool
    {
        if (! $avatar || self::isTeamAvatar($avatar)) {
            return false;
        }

        return str_contains($avatar, '<img') && str_contains($avatar, 'lisani-avatar-img');
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

    public static function resolve(?string $avatar, ?int $userId = null): string
    {
        if (self::isTeamAvatar($avatar)) {
            return $avatar ?? self::defaultHtml();
        }

        if (self::isCustomPhotoAvatar($avatar)) {
            return $avatar;
        }

        return self::defaultHtml();
    }
}
