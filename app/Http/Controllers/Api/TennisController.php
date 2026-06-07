<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TennisRoom;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TennisController extends Controller
{
    private const PADDLE_MIN = 0;

    private const PADDLE_MAX = 248;

    public function create(Request $request): JsonResponse
    {
        $user = $request->user();

        TennisRoom::query()
            ->where('host_id', $user->id)
            ->whereIn('status', [TennisRoom::STATUS_WAITING, TennisRoom::STATUS_PLAYING])
            ->delete();

        $room = TennisRoom::create([
            'code' => TennisRoom::generateCode(),
            'host_id' => $user->id,
            'status' => TennisRoom::STATUS_WAITING,
            'host_paddle_x' => 124,
            'guest_paddle_x' => 124,
            'game_state' => TennisRoom::defaultGameState(),
            'host_last_seen' => now(),
        ]);

        return response()->json([
            'success' => true,
            'room' => $room->fresh(['host', 'guest'])->toFrontendArray($user),
        ]);
    }

    public function join(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $code = strtoupper(trim($code));

        $room = TennisRoom::query()
            ->where('code', $code)
            ->with(['host', 'guest'])
            ->first();

        if (! $room) {
            return response()->json(['message' => 'Oda bulunamadı.'], 404);
        }

        if ($room->status === TennisRoom::STATUS_FINISHED) {
            return response()->json(['message' => 'Bu maç sona ermiş.'], 410);
        }

        if ((int) $room->host_id === (int) $user->id) {
            $room->touchPresence($user);
            $room->save();

            return response()->json([
                'success' => true,
                'room' => $room->toFrontendArray($user),
            ]);
        }

        if ($room->guest_id && (int) $room->guest_id !== (int) $user->id) {
            return response()->json(['message' => 'Oda dolu.'], 409);
        }

        $room->guest_id = $user->id;
        $room->status = TennisRoom::STATUS_PLAYING;
        $room->guest_last_seen = now();
        $room->game_state = TennisRoom::defaultGameState();
        $room->save();

        return response()->json([
            'success' => true,
            'room' => $room->fresh(['host', 'guest'])->toFrontendArray($user),
        ]);
    }

    public function state(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = $this->findAuthorizedRoom($user, $code);

        if (! $room) {
            return response()->json(['message' => 'Odaya erişim yok.'], 403);
        }

        $room->touchPresence($user);
        $room->save();

        return response()->json([
            'room' => $room->fresh(['host', 'guest'])->toFrontendArray($user),
        ]);
    }

    public function input(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = $this->findAuthorizedRoom($user, $code);

        if (! $room) {
            return response()->json(['message' => 'Odaya erişim yok.'], 403);
        }

        $validated = $request->validate([
            'paddleX' => ['required', 'numeric', 'min:'.self::PADDLE_MIN, 'max:'.self::PADDLE_MAX],
        ]);

        $paddleX = (float) $validated['paddleX'];
        $role = $room->roleFor($user);

        if ($role === 'host') {
            $room->host_paddle_x = $paddleX;
            $room->host_last_seen = now();
        } elseif ($role === 'guest') {
            $room->guest_paddle_x = $paddleX;
            $room->guest_last_seen = now();
        }

        $room->save();

        return response()->json(['success' => true]);
    }

    public function sync(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = $this->findAuthorizedRoom($user, $code);

        if (! $room || $room->roleFor($user) !== 'host') {
            return response()->json(['message' => 'Senkron yetkisi yok.'], 403);
        }

        $validated = $request->validate([
            'gameState' => ['required', 'array'],
            'hostPaddleX' => ['nullable', 'numeric', 'min:'.self::PADDLE_MIN, 'max:'.self::PADDLE_MAX],
            'guestPaddleX' => ['nullable', 'numeric', 'min:'.self::PADDLE_MIN, 'max:'.self::PADDLE_MAX],
        ]);

        $state = $validated['gameState'];
        $state['seq'] = (int) ($room->game_state['seq'] ?? 0) + 1;

        $room->game_state = $state;
        if (isset($validated['hostPaddleX'])) {
            $room->host_paddle_x = (float) $validated['hostPaddleX'];
        }
        if (isset($validated['guestPaddleX'])) {
            $room->guest_paddle_x = (float) $validated['guestPaddleX'];
        }
        $room->host_last_seen = now();

        if (! empty($state['matchOver'])) {
            $room->status = TennisRoom::STATUS_FINISHED;
        }

        $room->save();

        return response()->json(['success' => true, 'seq' => $state['seq']]);
    }

    public function leave(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = TennisRoom::query()->where('code', strtoupper(trim($code)))->first();

        if (! $room) {
            return response()->json(['success' => true]);
        }

        $role = $room->roleFor($user);
        if (! $role) {
            return response()->json(['success' => true]);
        }

        if ($role === 'host') {
            $room->delete();
        } else {
            $room->guest_id = null;
            $room->status = TennisRoom::STATUS_WAITING;
            $room->game_state = TennisRoom::defaultGameState();
            $room->save();
        }

        return response()->json(['success' => true]);
    }

    public function invite(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = $this->findAuthorizedRoom($user, $code);

        if (! $room || $room->roleFor($user) !== 'host') {
            return response()->json(['message' => 'Davet gönderilemedi.'], 403);
        }

        $validated = $request->validate([
            'partner_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $partner = User::find($validated['partner_id']);
        if (! $partner || (int) $partner->id === (int) $user->id) {
            return response()->json(['message' => 'Geçersiz arkadaş.'], 422);
        }

        return response()->json([
            'success' => true,
            'invite' => [
                'code' => $room->code,
                'from' => $user->name,
                'message' => $user->name.' seni tenis maçına davet ediyor! Oda kodu: '.$room->code,
            ],
        ]);
    }

    private function findAuthorizedRoom(User $user, string $code): ?TennisRoom
    {
        $room = TennisRoom::query()
            ->where('code', strtoupper(trim($code)))
            ->with(['host', 'guest'])
            ->first();

        if (! $room || ! $room->roleFor($user)) {
            return null;
        }

        return $room;
    }
}
