<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bank_code',
        'bank_name',
        'account_number',
        'account_holder_name',
        'is_verified',
        'is_primary',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'is_primary' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeByBank($query, $bankCode)
    {
        return $query->where('bank_code', $bankCode);
    }

    // Helper methods
    public function getMaskedAccountNumberAttribute()
    {
        $accountNumber = $this->account_number;
        $length = strlen($accountNumber);
        
        if ($length <= 4) {
            return $accountNumber;
        }
        
        return str_repeat('*', $length - 4) . substr($accountNumber, -4);
    }

    public function markAsVerified()
    {
        $this->is_verified = true;
        $this->verified_at = now();
        $this->save();
    }

    public function makePrimary()
    {
        // Remove primary flag from other accounts
        self::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        // Set this account as primary
        $this->is_primary = true;
        $this->save();
    }

    public static function getSupportedBanks()
    {
        return [
            'BCA' => 'Bank Central Asia',
            'BNI' => 'Bank Negara Indonesia',
            'BRI' => 'Bank Rakyat Indonesia',
            'MANDIRI' => 'Bank Mandiri',
            'PERMATA' => 'Bank Permata',
            'CIMB' => 'CIMB Niaga',
            'DANAMON' => 'Bank Danamon',
            'BSI' => 'Bank Syariah Indonesia',
            'BCA_SYARIAH' => 'BCA Syariah',
            'MAYBANK' => 'Maybank Indonesia'
        ];
    }

    public function getBankNameDisplayAttribute()
    {
        $banks = self::getSupportedBanks();
        return $banks[$this->bank_code] ?? $this->bank_name;
    }
}
