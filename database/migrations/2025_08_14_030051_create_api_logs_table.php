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
        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // webhook, external_api, internal_api
            $table->string('method', 10); // GET, POST, PUT, etc
            $table->string('endpoint');
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->integer('response_code')->nullable();
            $table->decimal('response_time', 8, 3)->nullable(); // milliseconds
            $table->string('external_reference')->nullable();
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index(['type', 'created_at']);
            $table->index(['transaction_id', 'created_at']);
            $table->index(['response_code', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
    }
};
