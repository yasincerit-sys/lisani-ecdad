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
            'avatar_file' => 'istanbul/ayasofya.svg',
            'slug' => 'elif',
            'total_xp' => 21000,
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
            'avatar_file' => 'istanbul/galata.svg',
            'slug' => 'lugat',
            'total_xp' => 16000,
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
            'avatar_file' => 'istanbul/kiz-kulesi.svg',
            'slug' => 'tercume',
            'total_xp' => 22000,
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
            'avatar_file' => 'saray-kavvesi.svg',
            'slug' => 'hikmet',
            'total_xp' => 11500,
            'avg_success' => 72,
            'tests' => [
                ['date' => '06.06.2026', 'level' => 1, 'test' => 'Genel', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Karma', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '04.06.2026', 'level' => 1, 'test' => 'Tekrar', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '02.06.2026', 'level' => 2, 'test' => 'Karma 2', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
            ],
        ],
        [
            'name' => 'Mehmet',
            'email' => 'bot.mehmet@lisaniecdad.app',
            'avatar_file' => 'istanbul/bogaz.svg',
            'slug' => 'mehmet',
            'total_xp' => 13000,
            'avg_success' => 82,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 2, 'test' => 'Test 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '05.06.2026', 'level' => 1, 'test' => 'Test 2', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '03.06.2026', 'level' => 1, 'test' => 'Test 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Ayşe',
            'email' => 'bot.ayse@lisaniecdad.app',
            'avatar_file' => 'istanbul/balat.svg',
            'slug' => 'ayse',
            'total_xp' => 19000,
            'avg_success' => 86,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 3, 'test' => 'Test 1', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '06.06.2026', 'level' => 2, 'test' => 'Genel', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '04.06.2026', 'level' => 2, 'test' => 'Test 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '02.06.2026', 'level' => 1, 'test' => 'Test 3', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
            ],
        ],
        [
            'name' => 'Zeynep',
            'email' => 'bot.zeynep@lisaniecdad.app',
            'avatar_file' => 'istanbul/gunbatimi.svg',
            'slug' => 'zeynep',
            'total_xp' => 24000,
            'avg_success' => 90,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 3, 'test' => 'Genel', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '06.06.2026', 'level' => 3, 'test' => 'Test 2', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Test 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Can',
            'email' => 'bot.can@lisaniecdad.app',
            'avatar_file' => 'istanbul/kopru.svg',
            'slug' => 'can',
            'total_xp' => 10000,
            'avg_success' => 70,
            'tests' => [
                ['date' => '06.06.2026', 'level' => 1, 'test' => 'Test 1', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '04.06.2026', 'level' => 1, 'test' => 'Test 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Ece',
            'email' => 'bot.ece@lisaniecdad.app',
            'avatar_file' => 'istanbul/camii.svg',
            'slug' => 'ece',
            'total_xp' => 15000,
            'avg_success' => 78,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 2, 'test' => 'Test 3', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Test 1', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '03.06.2026', 'level' => 1, 'test' => 'Test 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Burak',
            'email' => 'bot.burak@lisaniecdad.app',
            'avatar_file' => 'istanbul/eminonu.svg',
            'slug' => 'burak',
            'total_xp' => 17500,
            'avg_success' => 83,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 2, 'test' => 'Genel', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '06.06.2026', 'level' => 2, 'test' => 'Test 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '04.06.2026', 'level' => 1, 'test' => 'Test 1', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
            ],
        ],
        [
            'name' => 'Selin',
            'email' => 'bot.selin@lisaniecdad.app',
            'avatar_file' => 'istanbul/panorama.svg',
            'slug' => 'selin',
            'total_xp' => 12000,
            'avg_success' => 74,
            'tests' => [
                ['date' => '06.06.2026', 'level' => 1, 'test' => 'Test 3', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '03.06.2026', 'level' => 1, 'test' => 'Test 1', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
            ],
        ],
        [
            'name' => 'Emre',
            'email' => 'bot.emre@lisaniecdad.app',
            'avatar_file' => 'istanbul/sokak.svg',
            'slug' => 'emre',
            'total_xp' => 20000,
            'avg_success' => 85,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 3, 'test' => 'Test 1', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Test 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '02.06.2026', 'level' => 2, 'test' => 'Test 3', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Deniz',
            'email' => 'bot.deniz@lisaniecdad.app',
            'avatar_file' => 'besiktas.svg',
            'slug' => 'deniz',
            'total_xp' => 11000,
            'avg_success' => 68,
            'tests' => [
                ['date' => '06.06.2026', 'level' => 1, 'test' => 'Test 1', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '04.06.2026', 'level' => 1, 'test' => 'Test 2', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Fatma',
            'email' => 'bot.fatma@lisaniecdad.app',
            'avatar_file' => 'bursaspor.svg',
            'slug' => 'fatma',
            'total_xp' => 17000,
            'avg_success' => 80,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 2, 'test' => 'Test 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '05.06.2026', 'level' => 2, 'test' => 'Genel', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '01.06.2026', 'level' => 1, 'test' => 'Test 3', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Ali',
            'email' => 'bot.ali@lisaniecdad.app',
            'avatar_file' => 'goztepe.svg',
            'slug' => 'ali',
            'total_xp' => 18000,
            'avg_success' => 87,
            'tests' => [
                ['date' => '07.06.2026', 'level' => 3, 'test' => 'Test 2', 'correct' => 5, 'wrong' => 0, 'percent' => 100],
                ['date' => '06.06.2026', 'level' => 2, 'test' => 'Test 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '03.06.2026', 'level' => 2, 'test' => 'Test 3', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
            ],
        ],
        [
            'name' => 'Seda',
            'email' => 'bot.seda@lisaniecdad.app',
            'avatar_file' => 'eskisehirspor.svg',
            'slug' => 'seda',
            'total_xp' => 14000,
            'avg_success' => 75,
            'tests' => [
                ['date' => '06.06.2026', 'level' => 2, 'test' => 'Test 2', 'correct' => 3, 'wrong' => 2, 'percent' => 60],
                ['date' => '04.06.2026', 'level' => 1, 'test' => 'Test 1', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
                ['date' => '02.06.2026', 'level' => 1, 'test' => 'Genel', 'correct' => 4, 'wrong' => 1, 'percent' => 80],
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
        $sinifs = HocaClassRegistry::ensureAll();
        $botEmails = self::emails();

        foreach (Sinif::all() as $sinif) {
            $ids = collect($sinif->ogrenciler ?? [])
                ->map(fn ($id) => (int) $id)
                ->filter(function (int $id) use ($botEmails) {
                    $user = User::find($id);

                    return $user && ! in_array($user->email, $botEmails, true);
                })
                ->map(fn (int $id) => (string) $id)
                ->values()
                ->all();
            $sinif->ogrenciler = $ids;
            $sinif->save();
        }

        $sinifs = array_map(fn (Sinif $s) => $s->fresh(), $sinifs);

        $bots = self::BOTS;
        $botCount = count($bots);
        $classCount = count($sinifs);
        $base = intdiv($botCount, max($classCount, 1));
        $extra = $botCount % max($classCount, 1);
        $offset = 0;

        foreach ($sinifs as $classIndex => $sinif) {
            $size = $base + ($classIndex < $extra ? 1 : 0);
            $botChunk = array_slice($bots, $offset, $size);
            $offset += $size;

            foreach ($botChunk as $bot) {
                $user = User::updateOrCreate(
                    ['email' => $bot['email']],
                    [
                        'name' => $bot['name'],
                        'password' => $password,
                        'avatar' => AvatarHelper::teamHtml($bot['avatar_file']),
                        'role' => 'ogrenci',
                        'sinif_adi' => $sinif->sinif_adi,
                        'sinif_kodu' => $sinif->kisa_kod,
                        'total_score' => $bot['total_xp'],
                    ]
                );

                self::seedProgress($user, $bot);
                $sinif->addOgrenci($user);
            }
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
