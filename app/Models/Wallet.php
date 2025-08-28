<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'locked_balance',
        'wallet_number',
        'pin_hash',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'locked_balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helper methods
    public function getAvailableBalanceAttribute()
    {
        return $this->balance - $this->locked_balance;
    }

    public function lockBalance($amount)
    {
        if ($this->getAvailableBalanceAttribute() >= $amount) {
            $this->locked_balance += $amount;
            $this->save();
            return true;
        }
        return false;
    }

    public function unlockBalance($amount)
    {
        $this->locked_balance = max(0, (float) $this->locked_balance - (float) $amount);
        $this->save();
    }

    public function deductBalance($amount)
    {
        if ($this->balance >= $amount) {
            $this->balance -= $amount;
            $this->save();
            return true;
        }
        return false;
    }

    public function addBalance($amount)
    {
        $this->balance += $amount;
        $this->save();
        return true;
    }

    public function hasSufficientBalance($amount)
    {
        return $this->getAvailableBalanceAttribute() >= $amount;
    }

    public function generateWalletNumber()
    {
        do {
            $number = 'SP' . str_pad(mt_rand(1, 99999999), 8, '0', STR_PAD_LEFT);
        } while (self::where('wallet_number', $number)->exists());
        
        return $number;
    }
}
