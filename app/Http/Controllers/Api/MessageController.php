<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Sinif;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function contacts(Request $request): JsonResponse
    {
        $user = $request->user();
        $partners = $this->allowedPartners($user);

        $contacts = $partners->map(function (User $partner) use ($user) {
            $last = Message::query()
                ->where(function ($q) use ($user, $partner) {
                    $q->where('sender_id', $user->id)->where('receiver_id', $partner->id);
                })
                ->orWhere(function ($q) use ($user, $partner) {
                    $q->where('sender_id', $partner->id)->where('receiver_id', $user->id);
                })
                ->orderByDesc('created_at')
                ->first();

            $unread = Message::query()
                ->where('sender_id', $partner->id)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();

            return [
                'uid' => (string) $partner->id,
                'name' => $partner->name,
                'avatar' => $partner->avatar ?? '🐱',
                'role' => $partner->role,
                'lastMessage' => $last ? mb_strimwidth($last->body, 0, 80, '…') : null,
                'lastIsMine' => $last ? (int) $last->sender_id === $user->id : false,
                'lastAt' => $last?->created_at?->format('H:i'),
                'lastAtLabel' => $this->formatRelativeTime($last?->created_at),
                'lastTimestamp' => $last?->created_at?->timestamp ?? 0,
                'unreadCount' => $unread,
            ];
        })
            ->sortByDesc('lastTimestamp')
            ->values()
            ->all();

        $totalUnread = Message::query()
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->whereIn('sender_id', $partners->pluck('id'))
            ->count();

        return response()->json([
            'contacts' => $contacts,
            'unreadTotal' => $totalUnread,
        ]);
    }

    public function thread(Request $request, string $partnerId): JsonResponse
    {
        $user = $request->user();
        $partner = User::find($partnerId);

        if (! $partner || ! $this->canMessage($user, $partner)) {
            return response()->json(['message' => 'Bu kişiyle mesajlaşma yetkiniz yok.'], 403);
        }

        Message::query()
            ->where('sender_id', $partner->id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::query()
            ->where(function ($q) use ($user, $partner) {
                $q->where('sender_id', $user->id)->where('receiver_id', $partner->id);
            })
            ->orWhere(function ($q) use ($user, $partner) {
                $q->where('sender_id', $partner->id)->where('receiver_id', $user->id);
            })
            ->orderBy('created_at')
            ->limit(200)
            ->get()
            ->map(fn (Message $m) => $m->toFrontendArray($user->id))
            ->values()
            ->all();

        return response()->json([
            'partner' => [
                'uid' => (string) $partner->id,
                'name' => $partner->name,
                'avatar' => $partner->avatar ?? '🐱',
                'role' => $partner->role,
            ],
            'messages' => $messages,
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $partner = User::find($validated['receiver_id']);

        if (! $partner || ! $this->canMessage($user, $partner)) {
            return response()->json(['message' => 'Bu kişiye mesaj gönderemezsiniz.'], 403);
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $partner->id,
            'body' => trim($validated['body']),
        ]);

        return response()->json([
            'success' => true,
            'message' => $message->toFrontendArray($user->id),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $partnerIds = $this->allowedPartners($user)->pluck('id');

        $count = Message::query()
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->whereIn('sender_id', $partnerIds)
            ->count();

        return response()->json(['unreadTotal' => $count]);
    }

    private function allowedPartners(User $user)
    {
        if ($user->role === 'hoca') {
            $sinif = $user->sinifAsHoca;
            $ids = $sinif?->ogrenciler ?? [];

            return User::whereIn('id', $ids)->where('role', 'ogrenci')->get();
        }

        if ($user->role === 'ogrenci' && $user->sinif_kodu) {
            $sinif = Sinif::findByKod($user->sinif_kodu);
            if ($sinif?->hoca_id) {
                $hoca = User::find($sinif->hoca_id);
                if ($hoca) {
                    return collect([$hoca]);
                }
            }
        }

        return collect();
    }

    private function canMessage(User $a, User $b): bool
    {
        if ($a->id === $b->id) {
            return false;
        }

        return $this->allowedPartners($a)->contains('id', $b->id);
    }

    private function formatRelativeTime(?\Illuminate\Support\Carbon $at): ?string
    {
        if (! $at) {
            return null;
        }

        if ($at->isToday()) {
            return 'Bugün '.$at->format('H:i');
        }

        if ($at->isYesterday()) {
            return 'Dün '.$at->format('H:i');
        }

        if ($at->greaterThan(now()->subDays(6))) {
            $days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

            return $days[$at->dayOfWeek].' '.$at->format('H:i');
        }

        return $at->format('d.m H:i');
    }
}
