<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserSuspension extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'suspended_by',
        'lifted_by',
        'type',
        'reason',
        'status',
        'suspended_at',
        'expires_at',
        'lifted_at',
        'lift_reason',
    ];

    protected function casts(): array
    {
        return [
            'suspended_at' => 'datetime',
            'expires_at' => 'datetime',
            'lifted_at' => 'datetime',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function suspendedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    public function liftedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lifted_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where(function($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'active')
                    ->where('expires_at', '<=', now());
    }

    public function scopeLifted($query)
    {
        return $query->where('status', 'lifted');
    }

    public function scopeTemporary($query)
    {
        return $query->where('type', 'temporary');
    }

    public function scopePermanent($query)
    {
        return $query->where('type', 'permanent');
    }

    public function scopeByOperator($query, $operatorId)
    {
        return $query->where('suspended_by', $operatorId);
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active' && !$this->isExpired();
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at <= now();
    }

    public function canBeLifted()
    {
        return $this->status === 'active';
    }

    public function lift($liftedBy, $reason = null)
    {
        if (!$this->canBeLifted()) {
            return false;
        }

        $this->status = 'lifted';
        $this->lifted_by = $liftedBy;
        $this->lifted_at = now();
        $this->lift_reason = $reason;
        $this->save();

        return true;
    }

    public function getRemainingTimeAttribute()
    {
        if ($this->type === 'permanent' || !$this->expires_at) {
            return 'Permanent';
        }

        if ($this->isExpired()) {
            return 'Expired';
        }

        $diff = now()->diffInHours($this->expires_at);
        
        if ($diff < 24) {
            return $diff . ' jam';
        } else {
            return floor($diff / 24) . ' hari';
        }
    }

    public function getTypeDisplayAttribute()
    {
        return $this->type === 'temporary' ? 'Sementara' : 'Permanen';
    }

    public function getStatusDisplayAttribute()
    {
        $statuses = [
            'active' => 'Aktif',
            'lifted' => 'Dicabut',
            'expired' => 'Kedaluwarsa'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    // Auto expire suspensions
    public static function expireOverdueSuspensions()
    {
        self::where('status', 'active')
            ->where('type', 'temporary')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'expired']);
    }
}
