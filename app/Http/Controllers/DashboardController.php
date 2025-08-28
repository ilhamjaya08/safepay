<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\BankAccount;

class DashboardController extends Controller
{
    public function userDashboard()
    {
        $user = auth()->user();
        
        // Load user with suspensions
        $user->load(['suspensions' => function($query) {
            $query->where('status', 'active')
                  ->where(function($q) {
                      $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                  });
        }]);
        
        // Ensure user has wallet (create if doesn't exist)
        if (!$user->wallet) {
            $wallet = new Wallet();
            $wallet->user_id = $user->id;
            $wallet->wallet_number = $wallet->generateWalletNumber();
            $wallet->balance = '0.00';
            $wallet->save();
        }

        $wallet = $user->wallet;
        
        // Get recent transactions
        $recent_transactions = Transaction::where(function($query) use ($user) {
            $query->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
        })
        ->with(['sender', 'receiver'])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();

        // Check bank account status
        $bankAccount = BankAccount::where('user_id', $user->id)->first();
        
        // Real balance from wallet, or null/message if no wallet
        $realBalance = $wallet ? $wallet->balance : null;

        // Check user status
        $userStatus = [
            'is_active' => $user->is_active,
            'is_suspended' => $user->isSuspended(),
            'suspension' => $user->suspensions->first(),
            'can_transact' => $user->is_active && !$user->isSuspended()
        ];

        return Inertia::render('User/Dashboard', [
            'wallet' => $wallet,
            'transactions' => $recent_transactions,
            'bank_account' => $bankAccount,
            'real_balance' => $realBalance,
            'user_status' => $userStatus
        ]);
    }

    public function operator()
    {
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'active_users' => User::where('role', 'user')->active()->count(),
            'suspended_users' => User::whereHas('suspensions', function($q) {
                $q->where('status', 'active');
            })->count(),
            'daily_transactions' => Transaction::whereDate('created_at', today())->count(),
            'total_volume' => Transaction::where('status', 'completed')
                ->whereDate('created_at', today())
                ->sum('amount'),
            'pending_bank_applications' => BankAccount::where('status', 'pending')->count()
        ];

        $recent_users = User::where('role', 'user')
            ->with('wallet')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recent_transactions = Transaction::with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Operator/Dashboard', [
            'stats' => $stats,
            'recent_users' => $recent_users,
            'recent_transactions' => $recent_transactions
        ]);
    }

    public function manager()
    {
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'total_operators' => User::where('role', 'operator')->count(),
            'total_volume' => Wallet::sum('balance'),
            'monthly_transactions' => Transaction::whereMonth('created_at', now()->month)->count(),
            'monthly_volume' => Transaction::where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->sum('amount')
        ];

        $system_metrics = [
            'pending_transactions' => Transaction::where('status', 'pending')->count(),
            'failed_transactions' => Transaction::where('status', 'failed')->whereDate('created_at', today())->count(),
            'pending_bank_applications' => BankAccount::where('status', 'pending')->count(),
            'approved_bank_applications' => BankAccount::where('status', 'approved')->count()
        ];

        $recent_activities = Transaction::with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Manager/Dashboard', [
            'stats' => $stats,
            'system_metrics' => $system_metrics,
            'recent_activities' => $recent_activities
        ]);
    }

    public function managerActivities()
    {
        // Get all activities (transactions) - no filters, just all data
        $activities = Transaction::with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                $transaction->description = $this->getTransactionDescription($transaction);
                return $transaction;
            });

        return Inertia::render('Manager/Activities', [
            'activities' => $activities
        ]);
    }

    private function getTransactionDescription($transaction)
    {
        switch ($transaction->type) {
            case 'transfer_internal':
                return 'Internal Transfer';
            case 'transfer_external':
                return 'External Bank Transfer';
            case 'receive_external':
                return 'Received from External Bank';
            case 'payment_qr':
                return 'QR Code Payment';
            case 'topup':
                return 'Wallet Top Up';
            case 'withdrawal':
                return 'Cash Withdrawal';
            case 'card_transaction':
                return 'Card Transaction';
            case 'refund':
                return 'Transaction Refund';
            default:
                return ucfirst(str_replace('_', ' ', $transaction->type));
        }
    }
}
