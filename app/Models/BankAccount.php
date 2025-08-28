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
        'account_type',
        'account_prefix',
        'branch_code',
        'account_number',
        'account_holder_name',
        'id_card_number',
        'date_of_birth',
        'address',
        'phone_number',
        'mother_maiden_name',
        'is_verified',
        'is_primary',
        'status',
        'rejection_reason',
        'verified_at',
        'reviewed_at',
        'reviewed_by',
        'balance',
        'locked_balance',
    ];

    protected $appends = [
        'account_type_display',
        'branch_name', 
        'full_account_number',
        'masked_account_number'
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'is_primary' => 'boolean',
            'date_of_birth' => 'date',
            'verified_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'balance' => 'decimal:2',
            'locked_balance' => 'decimal:2',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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

    public function scopeByType($query, $accountType)
    {
        return $query->where('account_type', $accountType);
    }

    public function scopeByBranch($query, $branchCode)
    {
        return $query->where('branch_code', $branchCode);
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

    public static function getSupportedAccountTypes()
    {
        return [
            'savings' => 'Savings Account (Tabungan)',
            'checking' => 'Checking Account (Giro)',
            'premium' => 'Premium Account',
            'business' => 'Business Account'
        ];
    }

    public static function getBranches()
    {
        return [
            '001' => 'SafePay Jakarta Pusat',
            '002' => 'SafePay Jakarta Barat', 
            '003' => 'SafePay Jakarta Timur',
            '004' => 'SafePay Jakarta Selatan',
            '005' => 'SafePay Jakarta Utara',
            '010' => 'SafePay Surabaya',
            '020' => 'SafePay Bandung',
            '030' => 'SafePay Medan',
            '040' => 'SafePay Semarang',
            '050' => 'SafePay Yogyakarta'
        ];
    }

    public function getAccountTypeDisplayAttribute()
    {
        $types = self::getSupportedAccountTypes();
        return $types[$this->account_type] ?? $this->account_type;
    }

    public function getBranchNameAttribute()
    {
        $branches = self::getBranches();
        return $branches[$this->branch_code] ?? 'SafePay Branch ' . $this->branch_code;
    }

    public function getFullAccountNumberAttribute()
    {
        return $this->account_prefix . $this->branch_code . $this->account_number;
    }

    public function hasSufficientBalance($amount)
    {
        return ($this->balance - $this->locked_balance) >= $amount;
    }

    public function lockBalance($amount)
    {
        if (!$this->hasSufficientBalance($amount)) {
            return false;
        }
        $this->locked_balance += $amount;
        return $this->save();
    }

    public function unlockBalance($amount)
    {
        $this->locked_balance = max(0, $this->locked_balance - $amount);
        return $this->save();
    }

    public function deductBalance($amount)
    {
        $this->balance -= $amount;
        $this->locked_balance -= $amount;
        return $this->save();
    }

    public function creditBalance($amount)
    {
        $this->balance += $amount;
        return $this->save();
    }
}
