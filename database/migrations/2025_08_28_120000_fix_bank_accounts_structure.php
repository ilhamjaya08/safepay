<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $uniqueWithBankCode = 'bank_accounts_user_id_bank_code_account_number_unique';
        $uniqueUserId = 'bank_accounts_user_id_unique';

        if ($this->indexExists('bank_accounts', $uniqueWithBankCode)) {
            Schema::table('bank_accounts', function (Blueprint $table) use ($uniqueWithBankCode) {
                $table->dropUnique($uniqueWithBankCode);
            });
        }

        $columnsToDrop = array_filter([
            Schema::hasColumn('bank_accounts', 'bank_code') ? 'bank_code' : null,
            Schema::hasColumn('bank_accounts', 'bank_name') ? 'bank_name' : null,
        ]);

        if (!empty($columnsToDrop)) {
            Schema::table('bank_accounts', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }

        if (!Schema::hasColumn('bank_accounts', 'account_type')) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->string('account_type', 20)->default('savings')->after('user_id');
            });
        }

        if (!Schema::hasColumn('bank_accounts', 'account_prefix')) {
            $afterColumn = Schema::hasColumn('bank_accounts', 'account_type') ? 'account_type' : 'user_id';

            Schema::table('bank_accounts', function (Blueprint $table) use ($afterColumn) {
                $table->string('account_prefix', 5)->default('SP')->after($afterColumn);
            });
        }

        if (!Schema::hasColumn('bank_accounts', 'branch_code')) {
            $afterColumn = Schema::hasColumn('bank_accounts', 'account_prefix')
                ? 'account_prefix'
                : (Schema::hasColumn('bank_accounts', 'account_type') ? 'account_type' : 'user_id');

            Schema::table('bank_accounts', function (Blueprint $table) use ($afterColumn) {
                $table->string('branch_code', 10)->default('001')->after($afterColumn);
            });
        }

        if (!$this->indexExists('bank_accounts', $uniqueUserId)) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->unique('user_id');
            });
        }
    }

    public function down(): void
    {
        $uniqueUserId = 'bank_accounts_user_id_unique';

        if ($this->indexExists('bank_accounts', $uniqueUserId)) {
            Schema::table('bank_accounts', function (Blueprint $table) use ($uniqueUserId) {
                $table->dropUnique($uniqueUserId);
            });
        }

        $columnsToDrop = array_filter([
            Schema::hasColumn('bank_accounts', 'account_type') ? 'account_type' : null,
            Schema::hasColumn('bank_accounts', 'account_prefix') ? 'account_prefix' : null,
            Schema::hasColumn('bank_accounts', 'branch_code') ? 'branch_code' : null,
        ]);

        if (!empty($columnsToDrop)) {
            Schema::table('bank_accounts', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }

        if (!Schema::hasColumn('bank_accounts', 'bank_code')) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->string('bank_code', 10)->after('user_id');
            });
        }

        if (!Schema::hasColumn('bank_accounts', 'bank_name')) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->string('bank_name')->after('bank_code');
            });
        }

        $uniqueWithBankCode = 'bank_accounts_user_id_bank_code_account_number_unique';

        if (!$this->indexExists('bank_accounts', $uniqueWithBankCode)) {
            Schema::table('bank_accounts', function (Blueprint $table) use ($uniqueWithBankCode) {
                $table->unique(['user_id', 'bank_code', 'account_number'], $uniqueWithBankCode);
            });
        }
    }

    private function indexExists(string $table, string $index): bool
    {
        $database = Schema::getConnection()->getDatabaseName();

        $result = DB::select(
            'SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?',
            [$database, $table, $index]
        );

        $record = collect($result)->first();

        return (int) ($record->count ?? 0) > 0;
    }
};
