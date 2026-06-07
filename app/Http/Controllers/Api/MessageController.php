<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Sinif;
use App\Models\User;
use App\Support\AvatarHelper;
use App\Support\AiBotRegistry;
use App\Support\BotReplyService;
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
                'avatar' => AvatarHelper::resolve($partner->avatar, $partner->id),
                'role' => $partner->role,
                'lastMessage' => $last ? mb_strimwidth($last->body, 0, 80, '…') : null,
                'lastIsMine' => $last ? (int) $last->sender_id === $user->id : false,
                'lastAt' => $last?->created_at?->format('H:i'),
                'lastAtLabel' => $this->formatRelativeTime($last?->created_at),
                'lastTimestamp' => $last?->created_at?->timestamp ?? 0,
                'unreadCount' => $unread,
            ];
        })
            ->sort(function (array $a, array $b) {
                $ta = (int) ($a['lastTimestamp'] ?? 0);
                $tb = (int) ($b['lastTimestamp'] ?? 0);
                if ($ta !== $tb) {
                    return $tb <=> $ta;
                }

                return strcasecmp($a['name'] ?? '', $b['name'] ?? '');
            })
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
                'avatar' => AvatarHelper::resolve($partner->avatar, $partner->id),
                'role' => $partner->role,
            ],
            'messages' => $messages,
        ]);
    }

    public function send(Request $request, BotReplyService $botReplyService): JsonResponse
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

        $payload = [
            'success' => true,
            'message' => $message->toFrontendArray($user->id),
        ];

        if (AiBotRegistry::isBot($partner)) {
            $reply = Message::create([
                'sender_id' => $partner->id,
                'receiver_id' => $user->id,
                'body' => $botReplyService->reply($partner, trim($validated['body'])),
            ]);
            $payload['botReply'] = $reply->toFrontendArray($user->id);
        }

        return response()->json($payload);
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

            $students = User::whereIn('id', $ids)->where('role', 'ogrenci')->get();

            return $students
                ->merge($this->yoneticiUsers())
                ->merge($this->botUsers())
                ->unique('id')
                ->sortBy('name')
                ->values();
        }

        if ($user->role === 'yonetici') {
            return User::query()
                ->where('id', '!=', $user->id)
                ->orderBy('name')
                ->get();
        }

        if ($user->role === 'ogrenci') {
            $partners = collect();

            if ($user->sinif_kodu) {
                $sinif = Sinif::findByKod($user->sinif_kodu);
                if ($sinif?->hoca_id) {
                    $hoca = User::find($sinif->hoca_id);
                    if ($hoca) {
                        $partners->push($hoca);
                    }
                }
            }

            $yoneticiler = User::where('role', 'yonetici')->orderBy('name')->get();

            return $partners
                ->merge($yoneticiler)
                ->merge($this->botUsers())
                ->unique('id')
                ->sortBy('name')
                ->values();
        }

        return collect();
    }

    private function yoneticiUsers()
    {
        return User::where('role', 'yonetici')->orderBy('name')->get();
    }

    private function botUsers()
    {
        if (User::whereIn('email', AiBotRegistry::emails())->count() < count(AiBotRegistry::BOTS)) {
            AiBotRegistry::ensureBotsExist();
        }

        return User::whereIn('email', AiBotRegistry::emails())->orderBy('name')->get();
    }

    private function canMessage(User $a, User $b): bool
    {
        if ($a->id === $b->id) {
            return false;
        }

        if ($a->role === 'yonetici' || $b->role === 'yonetici') {
            return true;
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
