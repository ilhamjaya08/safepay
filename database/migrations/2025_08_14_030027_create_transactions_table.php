<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id', 50)->unique();
            $table->foreignId('sender_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('receiver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('type', [
                'transfer_internal', // Kirim ke sesama user
                'transfer_external', // Kirim ke bank lain
                'receive_external',  // Terima dari bank lain
                'payment_qr',        // Bayar via QR
                'topup',            // Top up saldo
                'withdrawal',       // Tarik tunai
                'card_transaction', // Transaksi kartu
                'refund'           // Refund
            ]);
            $table->decimal('amount', 15, 2);
            $table->decimal('fee', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2); // amount + fee
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('description')->nullable();
            $table->json('metadata')->nullable(); // For additional data (bank details, QR info, etc)
            $table->string('external_reference')->nullable(); // Reference from external bank/payment
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['sender_id', 'created_at']);
            $table->index(['receiver_id', 'created_at']);
            $table->index(['type', 'status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
