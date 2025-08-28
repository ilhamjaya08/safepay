<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->string('id_card_number', 20)->nullable()->after('account_holder_name');
            $table->date('date_of_birth')->nullable()->after('id_card_number');
            $table->text('address')->nullable()->after('date_of_birth');
            $table->string('phone_number', 20)->nullable()->after('address');
            $table->string('mother_maiden_name')->nullable()->after('phone_number');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('is_primary');
            $table->text('rejection_reason')->nullable()->after('status');
            $table->timestamp('reviewed_at')->nullable()->after('verified_at');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->after('reviewed_at');
        });
    }

    public function down(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropColumn([
                'id_card_number',
                'date_of_birth', 
                'address',
                'phone_number',
                'mother_maiden_name',
                'status',
                'rejection_reason',
                'reviewed_at',
                'reviewed_by'
            ]);
        });
    }
};
