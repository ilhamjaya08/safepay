<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ApiLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'method',
        'endpoint',
        'request_payload',
        'response_payload',
        'response_code',
        'response_time',
        'external_reference',
        'transaction_id',
        'ip_address',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'request_payload' => 'array',
            'response_payload' => 'array',
            'response_time' => 'decimal:3',
        ];
    }

    // Relationships
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    // Scopes
    public function scopeWebhooks($query)
    {
        return $query->where('type', 'webhook');
    }

    public function scopeExternalApi($query)
    {
        return $query->where('type', 'external_api');
    }

    public function scopeInternalApi($query)
    {
        return $query->where('type', 'internal_api');
    }

    public function scopeSuccessful($query)
    {
        return $query->whereBetween('response_code', [200, 299]);
    }

    public function scopeFailed($query)
    {
        return $query->where('response_code', '>=', 400);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('method', strtoupper($method));
    }

    public function scopeByEndpoint($query, $endpoint)
    {
        return $query->where('endpoint', 'like', "%{$endpoint}%");
    }

    public function scopeSlowRequests($query, $threshold = 1000)
    {
        return $query->where('response_time', '>', $threshold);
    }

    // Helper methods
    public function isSuccessful()
    {
        return $this->response_code >= 200 && $this->response_code < 300;
    }

    public function isFailed()
    {
        return $this->response_code >= 400;
    }

    public function isWebhook()
    {
        return $this->type === 'webhook';
    }

    public function isExternalApi()
    {
        return $this->type === 'external_api';
    }

    public function getFormattedResponseTimeAttribute()
    {
        if ($this->response_time < 1000) {
            return number_format($this->response_time, 0) . 'ms';
        } else {
            return number_format($this->response_time / 1000, 2) . 's';
        }
    }

    public function getStatusDisplayAttribute()
    {
        if ($this->isSuccessful()) {
            return 'Success';
        } elseif ($this->isFailed()) {
            return 'Failed';
        } else {
            return 'Unknown';
        }
    }

    public function getTypeDisplayAttribute()
    {
        $types = [
            'webhook' => 'Webhook',
            'external_api' => 'External API',
            'internal_api' => 'Internal API'
        ];

        return $types[$this->type] ?? $this->type;
    }

    // Static methods for logging
    public static function logWebhook($endpoint, $method, $requestPayload, $responsePayload = null, $responseCode = null, $responseTime = null, $transactionId = null)
    {
        return self::create([
            'type' => 'webhook',
            'method' => strtoupper($method),
            'endpoint' => $endpoint,
            'request_payload' => $requestPayload,
            'response_payload' => $responsePayload,
            'response_code' => $responseCode,
            'response_time' => $responseTime,
            'transaction_id' => $transactionId,
            'ip_address' => request()->ip(),
        ]);
    }

    public static function logExternalApi($endpoint, $method, $requestPayload, $responsePayload = null, $responseCode = null, $responseTime = null, $externalReference = null, $transactionId = null, $errorMessage = null)
    {
        return self::create([
            'type' => 'external_api',
            'method' => strtoupper($method),
            'endpoint' => $endpoint,
            'request_payload' => $requestPayload,
            'response_payload' => $responsePayload,
            'response_code' => $responseCode,
            'response_time' => $responseTime,
            'external_reference' => $externalReference,
            'transaction_id' => $transactionId,
            'ip_address' => request()->ip(),
            'error_message' => $errorMessage,
        ]);
    }
}
