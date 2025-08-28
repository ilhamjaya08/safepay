<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            // Remove bank_code and bank_name since SafePay is the bank itself
            $table->dropColumn(['bank_code', 'bank_name']);
            
            // Add SafePay specific fields
            $table->string('account_type', 20)->default('savings')->after('user_id'); // savings, checking, etc
            $table->string('account_prefix', 5)->default('SP')->after('account_type'); // SafePay prefix
            $table->string('branch_code', 10)->default('001')->after('account_prefix'); // Branch identifier
        });
        
        // Remove the unique constraint that included bank_code
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'bank_code', 'account_number']);
            // Add new unique constraint - one account per user for now
            $table->unique(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            $table->dropColumn(['account_type', 'account_prefix', 'branch_code']);
            $table->string('bank_code', 10)->after('user_id');
            $table->string('bank_name')->after('bank_code');
            $table->unique(['user_id', 'bank_code', 'account_number']);
        });
    }
};
