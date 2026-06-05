<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProgress extends Model
{
    protected $table = 'user_progress';

    protected $fillable = [
        'user_id',
        'total_xp',
        'tests_count',
        'avg_success',
        'streak_days',
        'last_streak_date',
        'studied_letters',
        'last_active_at',
        'last_test_label',
        'last_test_percent',
        'recent_tests',
    ];

    protected function casts(): array
    {
        return [
            'total_xp' => 'integer',
            'tests_count' => 'integer',
            'avg_success' => 'integer',
            'streak_days' => 'integer',
            'last_streak_date' => 'date',
            'studied_letters' => 'array',
            'last_active_at' => 'datetime',
            'last_test_percent' => 'integer',
            'recent_tests' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activityStatus(): string
    {
        if (! $this->last_active_at) {
            return 'pasif';
        }

        $days = $this->last_active_at->diffInDays(now());

        if ($days <= 7) {
            return 'aktif';
        }
        if ($days <= 30) {
            return 'orta';
        }

        return 'pasif';
    }

    /** Günlük seriyi günceller (bugün ilk aktivitede). */
    public function recordStreakActivity(): void
    {
        $today = now()->startOfDay();

        if ($this->last_streak_date?->isSameDay($today)) {
            return;
        }

        $yesterday = $today->copy()->subDay();

        if ($this->last_streak_date?->isSameDay($yesterday)) {
            $this->streak_days = ($this->streak_days ?? 0) + 1;
        } elseif ($this->last_streak_date) {
            $this->streak_days = 1;
        } else {
            $this->streak_days = 1;
        }

        $this->last_streak_date = $today;
    }
}
