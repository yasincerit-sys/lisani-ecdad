<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sinif;
use App\Models\User;
use App\Models\UserProgress;
use App\Support\AvatarHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['hoca', 'yonetici'], true)) {
            return response()->json(['message' => 'Hocalar ve yöneticiler ilerleme kaydı görüntüleyemez.'], 403);
        }

        $progress = UserProgress::where('user_id', $user->id)->first();

        return response()->json([
            'total_xp' => $progress?->total_xp ?? $user->total_score ?? 0,
            'tests_count' => $progress?->tests_count ?? 0,
            'avg_success' => $progress?->avg_success ?? 0,
            'recent_tests' => $progress?->recent_tests ?? [],
            'last_test_label' => $progress?->last_test_label,
            'last_test_percent' => $progress?->last_test_percent,
            'last_active_at' => $progress?->last_active_at?->toIso8601String(),
        ]);
    }

    public function sync(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['hoca', 'yonetici'], true)) {
            return response()->json(['message' => 'Hocalar ve yöneticiler ilerleme senkronize edemez.'], 403);
        }

        $validated = $request->validate([
            'total_xp' => ['required', 'integer', 'min:0'],
            'tests_count' => ['required', 'integer', 'min:0'],
            'avg_success' => ['required', 'integer', 'min:0', 'max:100'],
            'last_test' => ['nullable', 'array'],
            'last_test.date' => ['nullable', 'string'],
            'last_test.level' => ['nullable'],
            'last_test.test' => ['nullable', 'string'],
            'last_test.percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'recent_tests' => ['nullable', 'array'],
            'recent_tests.*.date' => ['nullable', 'string'],
            'recent_tests.*.level' => ['nullable'],
            'recent_tests.*.test' => ['nullable', 'string'],
            'recent_tests.*.correct' => ['nullable', 'integer', 'min:0'],
            'recent_tests.*.wrong' => ['nullable', 'integer', 'min:0'],
            'recent_tests.*.percent' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $lastTest = $validated['last_test'] ?? null;
        $lastLabel = null;
        $lastPercent = null;

        if ($lastTest) {
            $lastLabel = 'S'.$lastTest['level'].' · '.$lastTest['test'].' ('.$lastTest['date'].')';
            $lastPercent = $lastTest['percent'] ?? null;
        }

        UserProgress::updateOrCreate(
            ['user_id' => $user->id],
            [
                'total_xp' => $validated['total_xp'],
                'tests_count' => $validated['tests_count'],
                'avg_success' => $validated['avg_success'],
                'last_active_at' => now(),
                'last_test_label' => $lastLabel,
                'last_test_percent' => $lastPercent,
                'recent_tests' => array_slice($validated['recent_tests'] ?? [], -30),
            ]
        );

        $user->total_score = $validated['total_xp'];
        $user->save();

        return response()->json(['success' => true]);
    }

    public function ogrenciTakip(Request $request): JsonResponse
    {
        $hoca = $request->user();

        if ($hoca->role !== 'hoca') {
            return response()->json(['message' => 'Bu ekran sadece hocalar içindir.'], 403);
        }

        $sinif = $hoca->sinifAsHoca;

        if (! $sinif) {
            $sinif = Sinif::create([
                'hoca_id' => $hoca->id,
                'hoca_adi' => $hoca->name,
                'sinif_adi' => $hoca->sinif_adi ?: ($hoca->name."'in Grubu"),
                'kisa_kod' => Sinif::generateKisaKod(),
                'ogrenciler' => [],
                'odevler' => [],
            ]);
        }

        $ogrenciIds = collect($sinif->ogrenciler ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $ogrenciler = User::whereIn('id', $ogrenciIds)->get();
        $progressMap = UserProgress::whereIn('user_id', $ogrenciIds)->get()->keyBy('user_id');

        $liste = $ogrenciler->map(function (User $o) use ($progressMap) {
            $p = $progressMap->get($o->id);
            $analiz = self::buildAnalizRaporu($p);

            return [
                'uid' => (string) $o->id,
                'name' => $o->name,
                'avatar' => AvatarHelper::resolve($o->avatar, $o->id),
                'totalXp' => $p?->total_xp ?? $o->total_score ?? 0,
                'testsCount' => $p?->tests_count ?? 0,
                'avgSuccess' => $p?->avg_success ?? 0,
                'lastActiveAt' => $p?->last_active_at?->toIso8601String(),
                'lastTestLabel' => $p?->last_test_label,
                'lastTestPercent' => $p?->last_test_percent,
                'activityStatus' => $p?->activityStatus() ?? 'pasif',
                'recentTests' => $p?->recent_tests ?? [],
                'analiz' => $analiz,
            ];
        })->sortByDesc('totalXp')->values()->all();

        $aktif = collect($liste)->where('activityStatus', 'aktif')->count();
        $ortalamaBasari = collect($liste)->avg('avgSuccess') ?: 0;
        $toplamXp = collect($liste)->sum('totalXp');
        $toplamSinav = collect($liste)->sum('testsCount');
        $toplamDogru = collect($liste)->sum(fn ($o) => $o['analiz']['toplamDogru']);
        $toplamYanlis = collect($liste)->sum(fn ($o) => $o['analiz']['toplamYanlis']);

        return response()->json([
            'sinif' => [
                'sinifAdi' => $sinif->sinif_adi,
                'kisaKod' => $sinif->kisa_kod,
                'odevler' => $sinif->odevler ?? [],
            ],
            'ozet' => [
                'ogrenciSayisi' => count($liste),
                'aktifOgrenci' => $aktif,
                'ortalamaBasari' => (int) round($ortalamaBasari),
                'toplamXp' => $toplamXp,
                'toplamSinav' => $toplamSinav,
                'toplamDogru' => $toplamDogru,
                'toplamYanlis' => $toplamYanlis,
            ],
            'ogrenciler' => $liste,
        ]);
    }

    /** @return array{toplamDogru: int, toplamYanlis: int, sinavlar: array<int, array<string, mixed>>} */
    public static function buildAnalizRaporu(?UserProgress $progress): array
    {
        if (! $progress) {
            return ['toplamDogru' => 0, 'toplamYanlis' => 0, 'sinavlar' => []];
        }

        $tests = $progress->recent_tests ?? [];
        $toplamDogru = 0;
        $toplamYanlis = 0;
        $sinavlar = [];

        foreach ($tests as $t) {
            $dogru = (int) ($t['correct'] ?? 0);
            $yanlis = (int) ($t['wrong'] ?? 0);
            $toplamDogru += $dogru;
            $toplamYanlis += $yanlis;
            $sinavlar[] = [
                'date' => $t['date'] ?? '',
                'level' => $t['level'] ?? '',
                'test' => $t['test'] ?? '',
                'correct' => $dogru,
                'wrong' => $yanlis,
                'percent' => (int) ($t['percent'] ?? 0),
            ];
        }

        $sinavlar = array_reverse($sinavlar);

        return [
            'toplamDogru' => $toplamDogru,
            'toplamYanlis' => $toplamYanlis,
            'sinavlar' => $sinavlar,
        ];
    }
}
