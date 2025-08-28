<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransferController extends Controller
{
    public function index()
    {
        return Inertia::render('User/Transfer/Index');
    }

    public function qrTransfer($invoiceId = null)
    {
        $invoice = null;
        if ($invoiceId) {
            $invoice = Invoice::with('merchant')->find($invoiceId);
            if (!$invoice || $invoice->status !== 'pending' || $invoice->expires_at < now()) {
                return redirect()->route('user.qr.send')->with('error', 'Invalid or expired invoice');
            }
        }

        return Inertia::render('User/Transfer/QRTransfer', [
            'invoice' => $invoice
        ]);
    }

    public function processTransfer(Request $request)
    {
        $request->validate([
            'type' => 'required|in:internal',
            'receiver_identifier' => 'required|string',
            'amount' => 'required|numeric|min:1000|max:10000000',
            'description' => 'nullable|string|max:255',
            'pin' => 'required|string|min:4'
        ]);

        $user = auth()->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found'
            ], 404);
        }

        // Check if user is suspended
        if ($user->isSuspended()) {
            return response()->json([
                'success' => false,
                'message' => 'Account suspended - transfers are not allowed'
            ], 403);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account inactive - transfers are not allowed'
            ], 403);
        }

        // Verify PIN (simplified - in real app you'd hash and compare)
        if ($wallet->pin_hash && !password_verify($request->pin, $wallet->pin_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid PIN'
            ], 400);
        }

        DB::beginTransaction();
        
        try {
            $result = $this->processInternalTransfer($request, $user, $wallet);

            if ($result['success']) {
                DB::commit();
                return response()->json($result);
            } else {
                DB::rollBack();
                return response()->json($result, 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Transaction failed: ' . $e->getMessage()
            ], 500);
        }
    }



    private function processInternalTransfer(Request $request, User $user, Wallet $wallet)
    {
        // Find receiver by wallet number or email
        $receiver = User::with('wallet')
            ->where(function($query) use ($request) {
                $query->where('email', $request->receiver_identifier)
                      ->orWhereHas('wallet', function($q) use ($request) {
                          $q->where('wallet_number', $request->receiver_identifier);
                      });
            })
            ->first();

        if (!$receiver || !$receiver->wallet) {
            return ['success' => false, 'message' => 'Receiver not found'];
        }

        if ($receiver->id === $user->id) {
            return ['success' => false, 'message' => 'Cannot transfer to yourself'];
        }

        // Check if receiver is suspended or inactive
        if ($receiver->isSuspended() || !$receiver->is_active) {
            return ['success' => false, 'message' => 'Cannot transfer to inactive/suspended account'];
        }

        $amount = $request->amount;

        if (!$wallet->hasSufficientBalance($amount)) {
            return ['success' => false, 'message' => 'Insufficient balance'];
        }

        // Lock balance
        if (!$wallet->lockBalance($amount)) {
            return ['success' => false, 'message' => 'Failed to lock balance'];
        }

        // Create transaction
        $transaction = Transaction::create([
            'transaction_number' => 'TXN-' . strtoupper(Str::random(10)),
            'sender_id' => $user->id,
            'receiver_id' => $receiver->id,
            'type' => 'transfer',
            'amount' => $amount,
            'description' => $request->description ?? 'Internal Transfer',
            'status' => 'processing'
        ]);

        // Process transfer
        $wallet->deductBalance($amount);
        $wallet->unlockBalance($amount);
        $receiver->wallet->addBalance($amount);

        // Update transaction
        $transaction->update(['status' => 'completed']);

        // Log transaction
        TransactionLog::create([
            'transaction_id' => $transaction->id,
            'status' => 'completed',
            'message' => 'Internal transfer processed successfully'
        ]);

        return [
            'success' => true,
            'message' => 'Transfer successful',
            'transaction' => $transaction->load(['sender', 'receiver'])
        ];
    }

    public function validateReceiver(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string'
        ]);

        $user = auth()->user();
        
        $receiver = User::with('wallet')
            ->where(function($query) use ($request) {
                $query->where('email', $request->identifier)
                      ->orWhereHas('wallet', function($q) use ($request) {
                          $q->where('wallet_number', $request->identifier);
                      });
            })
            ->first();

        if (!$receiver || !$receiver->wallet) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ]);
        }

        if ($receiver->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot transfer to yourself'
            ]);
        }

        return response()->json([
            'success' => true,
            'receiver' => [
                'id' => $receiver->id,
                'name' => $receiver->name,
                'email' => $receiver->email,
                'wallet_number' => $receiver->wallet->wallet_number
            ]
        ]);
    }
}
