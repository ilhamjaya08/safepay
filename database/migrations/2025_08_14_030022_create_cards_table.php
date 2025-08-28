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
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('card_number', 16)->unique();
            $table->string('card_holder_name');
            $table->string('cvv', 4);
            $table->date('expiry_date');
            $table->enum('card_type', ['visa', 'mastercard'])->default('visa');
            $table->enum('status', ['active', 'blocked', 'expired', 'cancelled'])->default('active');
            $table->decimal('daily_limit', 15, 2)->default(50000000); // 50M IDR default
            $table->decimal('monthly_limit', 15, 2)->default(500000000); // 500M IDR default
            $table->decimal('daily_used', 15, 2)->default(0);
            $table->decimal('monthly_used', 15, 2)->default(0);
            $table->date('daily_reset_date')->nullable();
            $table->date('monthly_reset_date')->nullable();
            $table->boolean('is_international')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
