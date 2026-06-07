<?php

namespace App\Support;

use App\Models\Sinif;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AiBotRegistry
{
    public const BOTS = [
        [
            'name' => 'Elif',
            'email' => 'bot.elif@lisaniecdad.app',
            'avatar' => '📜',
            'slug' => 'elif',
            'total_xp' => 420,
            'avg_success' => 88,
            'tests' => [
                ['date' => '05.06.2026', 'level' => 1, 'test' => 'Elifbası', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '04.06.2026', 'level' => 1, 'test' => 'Harfler 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '03.06.2026', 'level' => 1, 'test' => 'Harfler 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '02.06.2026', 'level' => 2, 'test' => 'Hece', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '01.06.2026', 'level' => 1, 'test' => 'Elifbası', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
            ],
        ],
        [
            'name' => 'Lügat',
            'email' => 'bot.lugat@lisaniecdad.app',
            'avatar' => '📖',
            'slug' => 'lugat',
            'total_xp' => 380,
            'avg_success' => 76,
            'tests' => [
                ['date' => '06.06.2026', 'level' => 2, 'test' => 'Kelime 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Kelime 2', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '04.06.2026', 'level' => 3, 'test' => 'Lügat', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '03.06.2026', 'level' => 2, 'test' => 'Anlam', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
            ],
        ],
        [
            'name' => 'Tercüme',
            'email' => 'bot.tercume@lisaniecdad.app',
            'avatar' => '🔄',
            'slug' => 'tercume',
            'total_xp' => 510,
            'avg_success' => 84,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 3, 'test' => 'Tercüme 1', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '06.06.2026', 'level' => 3, 'test' => 'Tercüme 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Cümle', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '04.06.2026', 'level' => 3, 'test' => 'Osmanlıca', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '03.06.2026', 'level' => 2, 'test' => 'Metin', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Hikmet',
            'email' => 'bot.hikmet@lisaniecdad.app',
            'avatar' => '✨',
            'slug' => 'hikmet',
            'total_xp' => 290,
            'avg_success' => 72,
            'tests' => [
                ['date' => '06.06.2026', 'level' => 1, 'test' => 'Genel', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Karma', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '04.06.2026', 'level' => 1, 'test' => 'Tekrar', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '02.06.2026', 'level' => 2, 'test' => 'Karma 2', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
            ],
        ],
    ];

    public static function emails(): array
    {
        return array_column(self::BOTS, 'email');
    }

    public static function isBot(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return in_array($user->email, self::emails(), true);
    }

    public static function ensureBotsExist(): void
    {
        $password = Hash::make(Str::random(32));
        $demoSinif = Sinif::where('kisa_kod', 'DEMO01')->first();
        $demoKod = $demoSinif?->kisa_kod;

        foreach (self::BOTS as $bot) {
            $user = User::updateOrCreate(
                ['email' => $bot['email']],
                [
                    'name' => $bot['name'],
                    'password' => $password,
                    'avatar' => $bot['avatar'],
                    'role' => 'ogrenci',
                    'sinif_adi' => $demoSinif?->sinif_adi ?? 'Osmanlıca AI Grubu',
                    'sinif_kodu' => $demoKod,
                    'total_score' => $bot['total_xp'],
                ]
            );

            self::seedProgress($user, $bot);

            if ($demoSinif) {
                $ids = collect($demoSinif->ogrenciler ?? [])
                    ->map(fn ($id) => (int) $id)
                    ->push($user->id)
                    ->unique()
                    ->values()
                    ->all();
                $demoSinif->ogrenciler = $ids;
            }
        }

        if ($demoSinif) {
            $demoSinif->save();
        }
    }

    private static function seedProgress(User $user, array $bot): void
    {
        $tests = $bot['tests'] ?? [];
        $last = $tests[0] ?? null;
        $lastLabel = $last
            ? 'S'.$last['level'].' · '.$last['test'].' ('.$last['date'].')'
            : null;

        UserProgress::updateOrCreate(
            ['user_id' => $user->id],
            [
                'total_xp' => $bot['total_xp'],
                'tests_count' => count($tests),
                'avg_success' => $bot['avg_success'],
                'last_active_at' => now()->subHours(($user->id % 47) + 1),
                'last_test_label' => $lastLabel,
                'last_test_percent' => $last['percent'] ?? null,
                'recent_tests' => $tests,
            ]
        );
    }
}
