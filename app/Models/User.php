<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'is_active',
        'last_login',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }

    public function bankAccounts()
    {
        return $this->hasMany(BankAccount::class);
    }

    public function sentTransactions()
    {
        return $this->hasMany(Transaction::class, 'sender_id');
    }

    public function receivedTransactions()
    {
        return $this->hasMany(Transaction::class, 'receiver_id');
    }

    public function createdInvoices()
    {
        return $this->hasMany(Invoice::class, 'merchant_id');
    }

    public function paidInvoices()
    {
        return $this->hasMany(Invoice::class, 'customer_id');
    }

    public function suspensions()
    {
        return $this->hasMany(UserSuspension::class);
    }

    public function suspensionsCreated()
    {
        return $this->hasMany(UserSuspension::class, 'suspended_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    // Helper methods
    public function isUser()
    {
        return $this->role === 'user';
    }

    public function isOperator()
    {
        return $this->role === 'operator';
    }

    public function isManager()
    {
        return $this->role === 'manager';
    }

    public function hasPermission($permission)
    {
        $permissions = [
            'user' => ['view_own_data', 'transfer_funds', 'pay_invoice'],
            'operator' => ['view_user_activities', 'suspend_user', 'view_reports'],
            'manager' => ['view_user_activities', 'suspend_user', 'view_reports', 'manipulate_transactions', 'topup_balance']
        ];

        return in_array($permission, $permissions[$this->role] ?? []);
    }

    public function isSuspended()
    {
        return $this->suspensions()
                   ->where('status', 'active')
                   ->where(function($query) {
                       $query->whereNull('expires_at')
                             ->orWhere('expires_at', '>', now());
                   })->exists();
    }

    public function canTransact()
    {
        return $this->is_active && !$this->isSuspended();
    }

    public function canLogin()
    {
        return $this->is_active;
    }

    public function getActiveSuspension()
    {
        return $this->suspensions()
                   ->where('status', 'active')
                   ->where(function($query) {
                       $query->whereNull('expires_at')
                             ->orWhere('expires_at', '>', now());
                   })
                   ->latest()
                   ->first();
    }
}
