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
        Schema::create('user_suspensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('suspended_by')->constrained('users')->onDelete('cascade'); // Operator/Manager who suspended
            $table->foreignId('lifted_by')->nullable()->constrained('users')->onDelete('set null'); // Who lifted suspension
            $table->enum('type', ['temporary', 'permanent'])->default('temporary');
            $table->text('reason');
            $table->enum('status', ['active', 'lifted', 'expired'])->default('active');
            $table->timestamp('suspended_at');
            $table->timestamp('expires_at')->nullable(); // For temporary suspensions
            $table->timestamp('lifted_at')->nullable();
            $table->text('lift_reason')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['suspended_by', 'created_at']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_suspensions');
    }
};
