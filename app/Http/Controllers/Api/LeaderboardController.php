<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProgress;
use App\Support\AvatarHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min(50, max(10, (int) $request->query('limit', 30)));
        $scope = $request->query('scope', 'global');
        $viewer = $request->user();

        $query = User::whereIn('role', ['ogrenci', 'yonetici']);

        if ($scope === 'sinif' && $viewer->sinif_kodu) {
            $sinif = \App\Models\Sinif::findByKod($viewer->sinif_kodu);
            if ($sinif) {
                $ids = collect($sinif->ogrenciler ?? [])->map(fn ($id) => (int) $id)->filter()->unique();
                $query->whereIn('id', $ids);
            }
        }

        $ogrenciler = $query->get();
        $progressMap = UserProgress::whereIn('user_id', $ogrenciler->pluck('id'))->get()->keyBy('user_id');

        $liste = $ogrenciler->map(function (User $o) use ($progressMap) {
            $p = $progressMap->get($o->id);

            return [
                'uid' => (string) $o->id,
                'name' => $o->name,
                'avatar' => AvatarHelper::resolve($o->avatar, $o->id),
                'totalXp' => $p?->total_xp ?? $o->total_score ?? 0,
                'testsCount' => $p?->tests_count ?? 0,
                'avgSuccess' => $p?->avg_success ?? 0,
            ];
        })
            ->sortByDesc('totalXp')
            ->values()
            ->take($limit)
            ->values()
            ->map(function (array $row, int $index) {
                $row['rank'] = $index + 1;

                return $row;
            })
            ->all();

        $myRank = null;
        if (in_array($viewer->role, ['ogrenci', 'yonetici'], true)) {
            foreach ($liste as $row) {
                if ($row['uid'] === (string) $viewer->id) {
                    $myRank = $row['rank'];
                    break;
                }
            }
        }

        return response()->json([
            'scope' => $scope,
            'myRank' => $myRank,
            'entries' => $liste,
        ]);
    }
}
