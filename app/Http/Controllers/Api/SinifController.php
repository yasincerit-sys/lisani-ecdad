<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sinif;
use App\Models\User;
use App\Support\AvatarHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SinifController extends Controller
{
    public function show(string $kisaKod): JsonResponse
    {
        $sinif = Sinif::where('kisa_kod', strtoupper($kisaKod))->first();

        if (! $sinif) {
            return response()->json(['message' => 'Sınıf bulunamadı.'], 404);
        }

        return response()->json(['sinif' => $this->formatSinif($sinif)]);
    }

    public function mySinif(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! in_array($user->role, ['hoca', 'yonetici'], true)) {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $sinif = $user->sinifAsHoca;

        if (! $sinif) {
            $sinif = Sinif::create([
                'hoca_id' => $user->id,
                'hoca_adi' => $user->name,
                'sinif_adi' => $user->sinif_adi ?: ($user->name."'in Grubu"),
                'kisa_kod' => Sinif::generateKisaKod(),
                'ogrenciler' => [],
                'odevler' => [],
            ]);
        }

        return response()->json(['sinif' => $this->formatSinif($sinif)]);
    }

    public function join(Request $request, string $kisaKod): JsonResponse
    {
        $user = $request->user();
        $sinif = Sinif::where('kisa_kod', strtoupper($kisaKod))->first();

        if (! $sinif) {
            return response()->json(['message' => 'Sınıf bulunamadı.'], 404);
        }

        $sinif->addOgrenci($user);

        return response()->json([
            'success' => true,
            'sinif' => $this->formatSinif($sinif->fresh()),
            'user' => $user->fresh()->toFrontendArray(),
        ]);
    }

    public function myOdevler(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! in_array($user->role, ['ogrenci', 'yonetici'], true)) {
            return response()->json(['message' => 'Bu liste sadece öğrenci ve yönetici hesapları içindir.'], 403);
        }

        if (! $user->sinif_kodu) {
            return response()->json([
                'sinifAdi' => null,
                'hocaAdi' => null,
                'odevler' => [],
                'message' => 'Henüz bir sınıfa kayıtlı değilsiniz.',
            ]);
        }

        $sinif = Sinif::findByKod($user->sinif_kodu);

        if (! $sinif) {
            return response()->json([
                'sinifAdi' => $user->sinif_adi,
                'hocaAdi' => null,
                'odevler' => [],
                'message' => 'Sınıf bulunamadı. Ayarlardan sınıf kodunu güncelleyin.',
            ]);
        }

        $odevler = collect($sinif->odevler ?? [])
            ->reverse()
            ->values()
            ->all();

        return response()->json([
            'sinifAdi' => $sinif->sinif_adi,
            'hocaAdi' => $sinif->hoca_adi,
            'odevler' => $odevler,
        ]);
    }

    public function addOdev(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! in_array($user->role, ['hoca', 'yonetici'], true)) {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $rules = [
            'level' => ['required', 'integer', 'between:1,3'],
            'test' => ['required', 'string', 'in:Test 1,Test 2,Test 3,Genel'],
        ];

        if ($user->role === 'yonetici') {
            $rules['kisa_kod'] = ['required', 'string', 'min:4', 'max:20'];
        }

        $validated = $request->validate($rules);

        if ($user->role === 'hoca') {
            $sinif = $user->sinifAsHoca;
        } else {
            $sinif = Sinif::findByKod($validated['kisa_kod']);
        }

        if (! $sinif) {
            return response()->json(['message' => 'Sınıf bulunamadı.'], 404);
        }

        $level = (int) $validated['level'];
        $test = $validated['test'];
        $verenAdi = $user->role === 'yonetici' ? 'Yönetici · '.$user->name : $user->name;

        $odevler = $sinif->odevler ?? [];
        $odevler[] = [
            'type' => 'test',
            'level' => $level,
            'test' => $test,
            'label' => "Seviye {$level} — {$test}",
            'tarih' => now()->format('d.m.Y'),
            'hocaAdi' => $verenAdi,
        ];
        $sinif->odevler = $odevler;
        $sinif->save();

        return response()->json([
            'success' => true,
            'sinif' => $this->formatSinif($sinif->fresh()),
        ]);
    }

    private function formatSinif(Sinif $sinif): array
    {
        $ogrenciIds = $sinif->ogrenciler ?? [];
        $ogrenciler = User::whereIn('id', $ogrenciIds)->get()->map(fn (User $u) => [
            'uid' => (string) $u->id,
            'name' => $u->name,
            'avatar' => AvatarHelper::resolve($u->avatar, $u->id),
            'totalScore' => $u->total_score,
        ])->values()->all();

        return [
            'hocaId' => (string) $sinif->hoca_id,
            'hocaAdi' => $sinif->hoca_adi,
            'sinifAdi' => $sinif->sinif_adi,
            'kisaKod' => $sinif->kisa_kod,
            'ogrenciler' => $sinif->ogrenciler ?? [],
            'odevler' => $sinif->odevler ?? [],
            'ogrenciDetay' => $ogrenciler,
        ];
    }
}
