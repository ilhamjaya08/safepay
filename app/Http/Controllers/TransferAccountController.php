<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransferAccountController extends Controller
{
    public function transferByAccountNumber(Request $request)
    {
        $request->validate([
            'wallet_number' => 'required|string',
            'amount' => 'required|numeric|min:1000|max:10000000',
            'description' => 'nullable|string|max:255',
        ]);

        $user = auth()->user();
        $senderWallet = $user->wallet;

        if (!$senderWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Your wallet not found'
            ], 400);
        }

        // Check if sender is suspended or inactive
        if ($user->isSuspended() || !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account suspended/inactive - transfers are not allowed'
            ], 403);
        }

        // Find receiver by wallet number
        $receiverWallet = Wallet::where('wallet_number', $request->wallet_number)
            ->where('is_active', true)
            ->with('user')
            ->first();

        if (!$receiverWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Receiver wallet not found'
            ], 404);
        }

        if ($receiverWallet->user_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot transfer to your own wallet'
            ], 400);
        }

        // Check if receiver is suspended or inactive
        if ($receiverWallet->user->isSuspended() || !$receiverWallet->user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot transfer to suspended/inactive account'
            ], 403);
        }

        $amount = $request->amount;

        if (!$senderWallet->hasSufficientBalance($amount)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance'
            ], 400);
        }

        DB::beginTransaction();
        
        try {
            // Lock sender balance
            if (!$senderWallet->lockBalance($amount)) {
                throw new \Exception('Failed to lock sender balance');
            }

            // Create transaction record
            $transaction = Transaction::create([
                'transaction_id' => 'TXN' . date('Ymd') . strtoupper(Str::random(8)),
                'sender_id' => $user->id,
                'receiver_id' => $receiverWallet->user_id,
                'type' => 'transfer_internal',
                'amount' => $amount,
                'fee' => 0,
                'total_amount' => $amount,
                'status' => 'processing',
                'metadata' => json_encode([
                    'sender_wallet' => $senderWallet->wallet_number,
                    'receiver_wallet' => $receiverWallet->wallet_number,
                    'description' => $request->description
                ])
            ]);

            // Process transfer
            $senderWallet->deductBalance($amount);
            $senderWallet->unlockBalance($amount);
            $receiverWallet->addBalance($amount);

            // Update transaction status
            $transaction->update(['status' => 'completed']);

            // Log transaction
            TransactionLog::create([
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'action' => 'completed',
                'previous_status' => 'processing',
                'new_status' => 'completed',
                'notes' => 'Transfer by account number completed',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer completed successfully',
                'transaction' => $transaction->load(['sender', 'receiver'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Unlock balance if transaction failed
            if ($senderWallet) {
                $senderWallet->unlockBalance($amount);
            }

            // Log failed transaction
            TransactionLog::create([
                'transaction_id' => $transaction->id ?? null,
                'user_id' => $user->id,
                'action' => 'failed',
                'previous_status' => 'processing',
                'new_status' => 'failed',
                'notes' => 'Transfer failed: ' . $e->getMessage(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Transfer failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function searchWallet(Request $request)
    {
        $request->validate([
            'wallet_number' => 'required|string'
        ]);

        $wallet = Wallet::where('wallet_number', $request->wallet_number)
            ->where('is_active', true)
            ->with('user:id,name,email')
            ->first();

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found'
            ]);
        }

        // Check if wallet owner is suspended or inactive
        if ($wallet->user->isSuspended() || !$wallet->user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet owner account is suspended/inactive'
            ]);
        }

        return response()->json([
            'success' => true,
            'wallet' => [
                'wallet_number' => $wallet->wallet_number,
                'owner_name' => $wallet->user->name,
                'bank_name' => 'SafePay'
            ]
        ]);
    }
}
