<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Wallet;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create Manager
        $manager = User::create([
            'name' => 'System Manager',
            'email' => 'manager@safepay.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
            'phone' => '081234567890',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Operator
        $operator = User::create([
            'name' => 'Customer Service',
            'email' => 'operator@safepay.com',
            'password' => bcrypt('password'),
            'role' => 'operator',
            'phone' => '081234567891',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Test Users
        $user1 = User::create([
            'name' => 'John Doe',
            'email' => 'user@safepay.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'phone' => '081234567892',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $user2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@safepay.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'phone' => '081234567893',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create wallets for users
        foreach ([$user1, $user2] as $user) {
            $wallet = new Wallet();
            $wallet->user_id = $user->id;
            $wallet->wallet_number = $wallet->generateWalletNumber();
            $wallet->balance = rand(100000, 5000000); // Random balance for testing
            $wallet->is_active = true;
            $wallet->save();
        }

        // Create a test bank account application for user1 (pending)
        \App\Models\BankAccount::create([
            'user_id' => $user1->id,
            'bank_code' => 'BCA',
            'bank_name' => 'Bank Central Asia',
            'account_number' => '1234567890',
            'account_holder_name' => $user1->name,
            'id_card_number' => '1234567890123456',
            'date_of_birth' => '1990-01-01',
            'address' => 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta',
            'phone_number' => '081234567892',
            'mother_maiden_name' => 'Jane Smith',
            'status' => 'pending',
            'is_primary' => true
        ]);

        // Create approved bank account for user2
        \App\Models\BankAccount::create([
            'user_id' => $user2->id,
            'bank_code' => 'BNI',
            'bank_name' => 'Bank Negara Indonesia',
            'account_number' => '9876543210',
            'account_holder_name' => $user2->name,
            'id_card_number' => '6543210987654321',
            'date_of_birth' => '1985-05-15',
            'address' => 'Jl. Thamrin No. 456, Jakarta Selatan, DKI Jakarta',
            'phone_number' => '081234567893',
            'mother_maiden_name' => 'Mary Johnson',
            'status' => 'approved',
            'is_verified' => true,
            'verified_at' => now(),
            'is_primary' => true
        ]);
    }
}
