<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppRating;
use App\Support\AiBotRegistry;
use App\Support\AvatarHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppRatingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (AiBotRegistry::isBot($user)) {
            return response()->json(['success' => true]);
        }

        if (in_array($user->role, ['hoca', 'yonetici'], true)) {
            return response()->json(['success' => true, 'skipped' => true]);
        }

        $validated = $request->validate([
            'stars' => ['required', 'integer', 'min:1', 'max:5'],
            'source' => ['nullable', 'string', 'max:32'],
        ]);

        AppRating::create([
            'user_id' => $user->id,
            'stars' => $validated['stars'],
            'source' => $validated['source'] ?? 'app',
        ]);

        return response()->json(['success' => true]);
    }

    public function yoneticiUnreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'yonetici') {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        return response()->json([
            'unread_count' => AppRating::whereNull('read_at')->count(),
        ]);
    }

    public function yoneticiIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'yonetici') {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $ratings = AppRating::with('user:id,name,avatar,role,sinif_adi')
            ->orderByDesc('created_at')
            ->limit(40)
            ->get()
            ->map(function (AppRating $rating) {
                $u = $rating->user;

                return [
                    'id' => $rating->id,
                    'stars' => $rating->stars,
                    'source' => $rating->source,
                    'read' => $rating->read_at !== null,
                    'created_at' => $rating->created_at?->toIso8601String(),
                    'user' => $u ? [
                        'uid' => (string) $u->id,
                        'name' => $u->name,
                        'avatar' => AvatarHelper::resolve($u->avatar, $u->id),
                        'role' => $u->role,
                        'sinifAdi' => $u->sinif_adi,
                    ] : null,
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'ratings' => $ratings,
            'unread_count' => AppRating::whereNull('read_at')->count(),
        ]);
    }

    public function yoneticiMarkRead(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'yonetici') {
            return response()->json(['message' => 'Yetkisiz.'], 403);
        }

        $validated = $request->validate([
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer'],
        ]);

        $query = AppRating::whereNull('read_at');

        if (! empty($validated['ids'])) {
            $query->whereIn('id', $validated['ids']);
        }

        $query->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'unread_count' => AppRating::whereNull('read_at')->count(),
        ]);
    }
}
