<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'sender_id',
        'receiver_id',
        'type',
        'amount',
        'fee',
        'total_amount',
        'status',
        'description',
        'metadata',
        'external_reference',
        'invoice_id',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'metadata' => 'array',
            'processed_at' => 'datetime',
        ];
    }

    // Relationships
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(TransactionLog::class);
    }

    public function apiLogs(): HasMany
    {
        return $this->hasMany(ApiLog::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function($q) use ($userId) {
            $q->where('sender_id', $userId)
              ->orWhere('receiver_id', $userId);
        });
    }

    // Helper methods
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function canBeRefunded()
    {
        return $this->status === 'completed' && 
               in_array($this->type, ['transfer_internal', 'payment_qr', 'card_transaction']);
    }

    public function isInternalTransfer()
    {
        return $this->type === 'transfer_internal';
    }

    public function isExternalTransfer()
    {
        return in_array($this->type, ['transfer_external', 'receive_external']);
    }

    public function isPayment()
    {
        return in_array($this->type, ['payment_qr', 'card_transaction']);
    }

    public function updateStatus($newStatus, $notes = null, $userId = null)
    {
        $oldStatus = $this->status;
        $this->status = $newStatus;
        
        if ($newStatus === 'completed') {
            $this->processed_at = now();
        }
        
        $this->save();

        // Create log entry
        $this->logs()->create([
            'user_id' => $userId,
            'action' => 'updated',
            'previous_status' => $oldStatus,
            'new_status' => $newStatus,
            'notes' => $notes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return true;
    }

    public static function generateTransactionId()
    {
        do {
            $transactionId = 'TXN' . date('Ymd') . strtoupper(Str::random(8));
        } while (self::where('transaction_id', $transactionId)->exists());

        return $transactionId;
    }

    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2, ',', '.');
    }

    public function getFormattedTotalAmountAttribute()
    {
        return number_format($this->total_amount, 2, ',', '.');
    }

    public function getTypeDisplayAttribute()
    {
        $types = [
            'transfer_internal' => 'Transfer Internal',
            'transfer_external' => 'Transfer ke Bank Lain',
            'receive_external' => 'Terima dari Bank Lain',
            'payment_qr' => 'Pembayaran QR',
            'topup' => 'Top Up Saldo',
            'withdrawal' => 'Tarik Tunai',
            'card_transaction' => 'Transaksi Kartu',
            'refund' => 'Refund'
        ];

        return $types[$this->type] ?? $this->type;
    }

    public function getStatusDisplayAttribute()
    {
        $statuses = [
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'completed' => 'Selesai',
            'failed' => 'Gagal',
            'cancelled' => 'Dibatalkan'
        ];

        return $statuses[$this->status] ?? $this->status;
    }
}
