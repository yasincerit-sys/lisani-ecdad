<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sinif;
use App\Models\User;
use App\Models\UserProgress;
use App\Support\AiBotRegistry;
use App\Support\AvatarHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class YoneticiController extends Controller
{
    public function takip(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'yonetici') {
            return response()->json(['message' => 'Bu ekran sadece uygulama yöneticileri içindir.'], 403);
        }

        $ogrenciler = User::where('role', 'ogrenci')->orderBy('name')->get();
        $progressMap = UserProgress::whereIn('user_id', $ogrenciler->pluck('id'))->get()->keyBy('user_id');
        $sinifMap = Sinif::all()->keyBy('kisa_kod');

        $liste = $ogrenciler->map(function (User $o) use ($progressMap, $sinifMap) {
            $p = $progressMap->get($o->id);
            $analiz = ProgressController::buildAnalizRaporu($p);
            $sinif = $o->sinif_kodu ? $sinifMap->get(strtoupper($o->sinif_kodu)) : null;

            return [
                'uid' => (string) $o->id,
                'name' => $o->name,
                'avatar' => AvatarHelper::resolve($o->avatar, $o->id),
                'sinifAdi' => $sinif?->sinif_adi ?? $o->sinif_adi,
                'sinifKodu' => $o->sinif_kodu,
                'hocaAdi' => $sinif?->hoca_adi,
                'totalXp' => $p?->total_xp ?? $o->total_score ?? 0,
                'testsCount' => $p?->tests_count ?? 0,
                'avgSuccess' => $p?->avg_success ?? 0,
                'lastActiveAt' => $p?->last_active_at?->toIso8601String(),
                'lastTestLabel' => $p?->last_test_label,
                'lastTestPercent' => $p?->last_test_percent,
                'activityStatus' => $p?->activityStatus() ?? 'pasif',
                'recentTests' => $p?->recent_tests ?? [],
                'analiz' => $analiz,
                'isBot' => AiBotRegistry::isBot($o),
                'banned' => $o->isBanned(),
            ];
        })->sortByDesc('totalXp')->values()->all();

        $aktif = collect($liste)->where('activityStatus', 'aktif')->count();
        $ortalamaBasari = collect($liste)->avg('avgSuccess') ?: 0;

        $siniflar = Sinif::orderBy('sinif_adi')->get()->map(fn (Sinif $s) => [
            'sinifAdi' => $s->sinif_adi,
            'kisaKod' => $s->kisa_kod,
            'hocaAdi' => $s->hoca_adi,
            'ogrenciSayisi' => count($s->ogrenciler ?? []),
            'odevSayisi' => count($s->odevler ?? []),
            'odevler' => $s->odevler ?? [],
        ])->values()->all();

        $recentOdevler = collect($siniflar)
            ->flatMap(function (array $s) {
                return collect($s['odevler'] ?? [])->map(fn ($o) => array_merge($o, [
                    'sinifAdi' => $s['sinifAdi'],
                    'kisaKod' => $s['kisaKod'],
                ]));
            })
            ->sortByDesc('tarih')
            ->take(20)
            ->values()
            ->all();

        return response()->json([
            'sinif' => [
                'sinifAdi' => 'Tüm Uygulama',
                'kisaKod' => null,
                'odevler' => $recentOdevler,
            ],
            'siniflar' => $siniflar,
            'ozet' => [
                'ogrenciSayisi' => count($liste),
                'aktifOgrenci' => $aktif,
                'hocaSayisi' => User::where('role', 'hoca')->count(),
                'sinifSayisi' => Sinif::count(),
                'ortalamaBasari' => (int) round($ortalamaBasari),
                'toplamXp' => collect($liste)->sum('totalXp'),
                'toplamSinav' => collect($liste)->sum('testsCount'),
                'toplamDogru' => collect($liste)->sum(fn ($o) => $o['analiz']['toplamDogru']),
                'toplamYanlis' => collect($liste)->sum(fn ($o) => $o['analiz']['toplamYanlis']),
            ],
            'ogrenciler' => $liste,
        ]);
    }

    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'yonetici') {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $hocalar = User::where('role', 'hoca')->orderBy('name')->get()->map(function (User $h) {
            $sinif = $h->sinifAsHoca;
            $ogrenciSayisi = count($sinif?->ogrenciler ?? []);

            return [
                'uid' => (string) $h->id,
                'name' => $h->name,
                'avatar' => AvatarHelper::resolve($h->avatar, $h->id),
                'sinifAdi' => $sinif?->sinif_adi ?? $h->sinif_adi,
                'kisaKod' => $sinif?->kisa_kod,
                'ogrenciSayisi' => $ogrenciSayisi,
                'odevSayisi' => count($sinif?->odevler ?? []),
            ];
        })->values()->all();

        $siniflar = Sinif::orderBy('sinif_adi')->get()->map(fn (Sinif $s) => [
            'sinifAdi' => $s->sinif_adi,
            'kisaKod' => $s->kisa_kod,
            'hocaAdi' => $s->hoca_adi,
            'ogrenciSayisi' => count($s->ogrenciler ?? []),
            'odevSayisi' => count($s->odevler ?? []),
        ])->values()->all();

        return response()->json([
            'ozet' => [
                'kullaniciSayisi' => User::whereIn('role', ['ogrenci', 'hoca'])->count(),
                'ogrenciSayisi' => User::where('role', 'ogrenci')->count(),
                'hocaSayisi' => User::where('role', 'hoca')->count(),
                'sinifSayisi' => Sinif::count(),
            ],
            'hocalar' => $hocalar,
            'siniflar' => $siniflar,
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'yonetici') {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $users = User::whereIn('role', ['ogrenci', 'hoca'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'uid' => (string) $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'avatar' => AvatarHelper::resolve($u->avatar, $u->id),
                'sinifKodu' => $u->sinif_kodu,
                'sinifAdi' => $u->sinif_adi,
                'totalXp' => $u->total_score ?? 0,
                'banned' => $u->isBanned(),
                'bannedAt' => $u->banned_at?->toIso8601String(),
                'isBot' => AiBotRegistry::isBot($u),
            ])
            ->values()
            ->all();

        return response()->json(['users' => $users]);
    }

    public function banUser(Request $request, string $userId): JsonResponse
    {
        $admin = $request->user();

        if ($admin->role !== 'yonetici') {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $target = User::find($userId);

        if (! $target) {
            return response()->json(['message' => 'Kullanıcı bulunamadı.'], 404);
        }

        if ($target->role === 'yonetici') {
            return response()->json(['message' => 'Yönetici hesapları engellenemez.'], 403);
        }

        if ((int) $target->id === (int) $admin->id) {
            return response()->json(['message' => 'Kendinizi engelleyemezsiniz.'], 403);
        }

        if (AiBotRegistry::isBot($target)) {
            return response()->json(['message' => 'Asistan hesapları engellenemez.'], 403);
        }

        $target->banned_at = now();
        $target->save();

        return response()->json([
            'success' => true,
            'user' => [
                'uid' => (string) $target->id,
                'banned' => true,
            ],
        ]);
    }

    public function unbanUser(Request $request, string $userId): JsonResponse
    {
        $admin = $request->user();

        if ($admin->role !== 'yonetici') {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $target = User::find($userId);

        if (! $target) {
            return response()->json(['message' => 'Kullanıcı bulunamadı.'], 404);
        }

        $target->banned_at = null;
        $target->save();

        return response()->json([
            'success' => true,
            'user' => [
                'uid' => (string) $target->id,
                'banned' => false,
            ],
        ]);
    }
}
