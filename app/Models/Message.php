<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'body',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function toFrontendArray(int $currentUserId): array
    {
        return [
            'id' => $this->id,
            'senderId' => (string) $this->sender_id,
            'receiverId' => (string) $this->receiver_id,
            'body' => $this->body,
            'isMine' => (int) $this->sender_id === $currentUserId,
            'read' => $this->read_at !== null,
            'time' => $this->created_at->format('H:i'),
            'date' => $this->created_at->format('d.m.Y'),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
