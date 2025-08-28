<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'merchant_id',
        'customer_id',
        'merchant_name',
        'amount',
        'description',
        'status',
        'qr_code',
        'expires_at',
        'paid_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    // Relationships
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
                    ->orWhere('expires_at', '<', now());
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '>', now());
    }

    public function scopeByMerchant($query, $merchantId)
    {
        return $query->where('merchant_id', $merchantId);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    // Helper methods
    public function isPaid()
    {
        return $this->status === 'paid';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isExpired()
    {
        return $this->status === 'expired' || 
               ($this->status === 'pending' && $this->expires_at < now());
    }

    public function canBePaid()
    {
        return $this->status === 'pending' && !$this->isExpired();
    }

    public function markAsPaid($customerId = null)
    {
        if (!$this->canBePaid()) {
            return false;
        }

        $this->status = 'paid';
        $this->paid_at = now();
        
        if ($customerId) {
            $this->customer_id = $customerId;
        }
        
        $this->save();
        return true;
    }

    public function markAsExpired()
    {
        if ($this->status === 'pending') {
            $this->status = 'expired';
            $this->save();
        }
    }

    public static function generateInvoiceNumber()
    {
        do {
            $invoiceNumber = 'INV' . date('Ymd') . strtoupper(Str::random(6));
        } while (self::where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }

    public function generateQRCode()
    {
        // QR code data structure for payment
        $qrData = json_encode([
            'type' => 'invoice_payment',
            'invoice_id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'amount' => $this->amount,
            'merchant_name' => $this->merchant_name,
            'expires_at' => $this->expires_at->toISOString(),
        ]);

        $this->qr_code = base64_encode($qrData);
        $this->save();

        return $this->qr_code;
    }

    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2, ',', '.');
    }

    public function getTimeRemainingAttribute()
    {
        if ($this->isExpired()) {
            return 'Expired';
        }

        $diff = now()->diffInSeconds($this->expires_at);
        
        if ($diff < 60) {
            return $diff . ' detik';
        } elseif ($diff < 3600) {
            return floor($diff / 60) . ' menit';
        } else {
            return floor($diff / 3600) . ' jam';
        }
    }

    public function getStatusDisplayAttribute()
    {
        $statuses = [
            'pending' => 'Menunggu Pembayaran',
            'paid' => 'Sudah Dibayar',
            'expired' => 'Kedaluwarsa',
            'cancelled' => 'Dibatalkan'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    // Auto expire invoices
    public static function expireOverdueInvoices()
    {
        self::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);
    }
}
