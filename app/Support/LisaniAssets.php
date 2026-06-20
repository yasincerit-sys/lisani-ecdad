<?php

namespace App\Support;

class LisaniAssets
{
    public static function clientConfig(): array
    {
        $chestReadyPath = public_path('images/chest/treasure-chest-ready.png');
        $chestOpenedPath = public_path('images/chest/treasure-chest-opened.png');
        $chestLockedPath = public_path('images/chest/treasure-chest-locked.png');
        $kariyerCoverPath = public_path('images/kariyer-cover.jpg');
        $avatarPath = public_path('images/avatars/besiktas.svg');

        $chestRev = max(
            is_file($chestReadyPath) ? filemtime($chestReadyPath) : 0,
            is_file($chestOpenedPath) ? filemtime($chestOpenedPath) : 0,
            is_file($chestLockedPath) ? filemtime($chestLockedPath) : 0,
        ) ?: time();

        $kariyerCoverRev = is_file($kariyerCoverPath) ? filemtime($kariyerCoverPath) : time();
        $avatarRev = is_file($avatarPath) ? filemtime($avatarPath) : time();

        return [
            'avatars' => asset('images/avatars'),
            'avatarRev' => $avatarRev,
            'gokhanAudio' => asset('audio/gokhan-abi-call.mp4'),
            'gorillaImage' => asset('images/easter/kariyer-gorilla.png'),
            'secretVideo' => asset('video/easter/kariyer-secret-11.mp4'),
            'kariyerCover' => asset('images/kariyer-cover.jpg').'?v='.$kariyerCoverRev,
            'chestRev' => $chestRev,
            'chestReady' => asset('images/chest/treasure-chest-ready.png').'?v='.$chestRev,
            'chestOpened' => asset('images/chest/treasure-chest-opened.png').'?v='.$chestRev,
            'chestLocked' => asset('images/chest/treasure-chest-locked.png').'?v='.$chestRev,
        ];
    }
}
