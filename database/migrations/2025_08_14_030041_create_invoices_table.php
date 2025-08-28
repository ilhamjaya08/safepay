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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->unique();
            $table->foreignId('merchant_id')->nullable()->constrained('users')->onDelete('set null'); // Who creates the invoice
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null'); // Who pays
            $table->string('merchant_name');
            $table->decimal('amount', 15, 2);
            $table->string('description');
            $table->enum('status', ['pending', 'paid', 'expired', 'cancelled'])->default('pending');
            $table->string('qr_code')->nullable(); // QR code data
            $table->timestamp('expires_at');
            $table->timestamp('paid_at')->nullable();
            $table->json('metadata')->nullable(); // Additional invoice data
            $table->timestamps();
            
            $table->index(['merchant_id', 'status', 'created_at']);
            $table->index(['customer_id', 'status', 'created_at']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
