<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'card_number',
        'card_holder_name',
        'cvv',
        'expiry_date',
        'card_type',
        'status',
        'daily_limit',
        'monthly_limit',
        'daily_used',
        'monthly_used',
        'daily_reset_date',
        'monthly_reset_date',
        'is_international',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'daily_limit' => 'decimal:2',
            'monthly_limit' => 'decimal:2',
            'daily_used' => 'decimal:2',
            'monthly_used' => 'decimal:2',
            'daily_reset_date' => 'date',
            'monthly_reset_date' => 'date',
            'is_international' => 'boolean',
        ];
    }

    protected $hidden = [
        'cvv',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active' && !$this->isExpired();
    }

    public function isExpired()
    {
        return $this->expiry_date < now();
    }

    public function getMaskedCardNumberAttribute()
    {
        return '**** **** **** ' . substr($this->card_number, -4);
    }

    public function canPerformTransaction($amount)
    {
        if (!$this->isActive()) {
            return false;
        }

        $this->resetLimitsIfNeeded();

        return ($this->daily_used + $amount) <= $this->daily_limit &&
               ($this->monthly_used + $amount) <= $this->monthly_limit;
    }

    public function recordTransaction($amount)
    {
        $this->daily_used += $amount;
        $this->monthly_used += $amount;
        $this->save();
    }

    public function resetLimitsIfNeeded()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Reset daily limit
        if ($this->daily_reset_date < $today) {
            $this->daily_used = 0;
            $this->daily_reset_date = $today;
        }

        // Reset monthly limit
        if ($this->monthly_reset_date < $thisMonth) {
            $this->monthly_used = 0;
            $this->monthly_reset_date = $thisMonth;
        }

        $this->save();
    }

    public function getDailyRemainingLimitAttribute()
    {
        $this->resetLimitsIfNeeded();
        return max(0, $this->daily_limit - $this->daily_used);
    }

    public function getMonthlyRemainingLimitAttribute()
    {
        $this->resetLimitsIfNeeded();
        return max(0, $this->monthly_limit - $this->monthly_used);
    }

    public function generateCardNumber()
    {
        do {
            // Visa cards start with 4, Mastercard with 5
            $prefix = $this->card_type === 'visa' ? '4' : '5';
            $number = $prefix . str_pad(mt_rand(0, 999999999999999), 15, '0', STR_PAD_LEFT);
        } while (self::where('card_number', $number)->exists());
        
        return $number;
    }

    public function generateCVV()
    {
        return str_pad(mt_rand(0, 999), 3, '0', STR_PAD_LEFT);
    }
}
