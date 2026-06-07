<?php

namespace App\Models;

use App\Support\AvatarHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TennisRoom extends Model
{
    public const STATUS_WAITING = 'waiting';

    public const STATUS_PLAYING = 'playing';

    public const STATUS_FINISHED = 'finished';

    protected $fillable = [
        'code',
        'host_id',
        'guest_id',
        'status',
        'host_paddle_x',
        'guest_paddle_x',
        'game_state',
        'host_last_seen',
        'guest_last_seen',
    ];

    protected function casts(): array
    {
        return [
            'game_state' => 'array',
            'host_paddle_x' => 'float',
            'guest_paddle_x' => 'float',
            'host_last_seen' => 'datetime',
            'guest_last_seen' => 'datetime',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public static function defaultGameState(): array
    {
        return [
            'ballX' => 160,
            'ballY' => 148,
            'ballSpeedX' => 0,
            'ballSpeedY' => 0,
            'ballTrail' => [],
            'serveReady' => false,
            'countdown' => 3,
            'rallyHits' => 0,
            'hostScore' => 0,
            'guestScore' => 0,
            'matchOver' => false,
            'seq' => 0,
        ];
    }

    public static function generateCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function roleFor(User $user): ?string
    {
        if ((int) $this->host_id === (int) $user->id) {
            return 'host';
        }
        if ($this->guest_id && (int) $this->guest_id === (int) $user->id) {
            return 'guest';
        }

        return null;
    }

    public function touchPresence(User $user): void
    {
        if ((int) $this->host_id === (int) $user->id) {
            $this->host_last_seen = now();
        } elseif ($this->guest_id && (int) $this->guest_id === (int) $user->id) {
            $this->guest_last_seen = now();
        }
    }

    public function opponentFor(User $user): ?User
    {
        if ((int) $this->host_id === (int) $user->id) {
            return $this->guest;
        }
        if ($this->guest_id && (int) $this->guest_id === (int) $user->id) {
            return $this->host;
        }

        return null;
    }

    public function toFrontendArray(User $user): array
    {
        $role = $this->roleFor($user);
        $opponent = $this->opponentFor($user);

        return [
            'code' => $this->code,
            'status' => $this->status,
            'role' => $role,
            'hostPaddleX' => $this->host_paddle_x,
            'guestPaddleX' => $this->guest_paddle_x,
            'gameState' => $this->game_state ?? self::defaultGameState(),
            'host' => $this->host ? [
                'uid' => (string) $this->host->id,
                'name' => $this->host->name,
                'avatar' => AvatarHelper::resolve($this->host->avatar, $this->host->id),
            ] : null,
            'guest' => $this->guest ? [
                'uid' => (string) $this->guest->id,
                'name' => $this->guest->name,
                'avatar' => AvatarHelper::resolve($this->guest->avatar, $this->guest->id),
            ] : null,
            'opponent' => $opponent ? [
                'uid' => (string) $opponent->id,
                'name' => $opponent->name,
                'avatar' => AvatarHelper::resolve($opponent->avatar, $opponent->id),
            ] : null,
        ];
    }
}
