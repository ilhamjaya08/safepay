<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Support\SimpleXlsxExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

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

    public function managerActivities(Request $request)
    {
        $baseQuery = $this->filteredTransactionQuery($request);

        $transactions = (clone $baseQuery)
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(function (Transaction $transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_id' => $transaction->transaction_id ?? $transaction->id,
                    'type' => $transaction->type,
                    'type_label' => $transaction->type_display,
                    'status' => $transaction->status,
                    'amount' => (float) $transaction->amount,
                    'fee' => (float) ($transaction->fee ?? 0),
                    'total_amount' => (float) ($transaction->total_amount ?? $transaction->amount),
                    'description' => $this->getTransactionDescription($transaction),
                    'created_at' => optional($transaction->created_at)->toIso8601String(),
                    'sender' => $transaction->sender ? [
                        'id' => $transaction->sender->id,
                        'name' => $transaction->sender->name,
                        'email' => $transaction->sender->email,
                    ] : null,
                    'receiver' => $transaction->receiver ? [
                        'id' => $transaction->receiver->id,
                        'name' => $transaction->receiver->name,
                        'email' => $transaction->receiver->email,
                    ] : null,
                ];
            });

        $availableTypes = Transaction::query()
            ->select('type')
            ->distinct()
            ->whereNotNull('type')
            ->orderBy('type')
            ->pluck('type')
            ->values();

        $availableStatuses = Transaction::query()
            ->select('status')
            ->distinct()
            ->whereNotNull('status')
            ->orderBy('status')
            ->pluck('status')
            ->values();

        return Inertia::render('Manager/Activities', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'type' => $request->input('type', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
            'availableTypes' => $availableTypes,
            'availableStatuses' => $availableStatuses,
        ]);
    }

    public function exportManagerActivities(Request $request)
    {
        $validated = $request->validate([
            'format' => 'required|in:csv,xlsx',
            'scope' => 'required|in:all,last_days,last_month,date_range,last_transactions',
            'days' => 'nullable|required_if:scope,last_days|integer|min:1|max:365',
            'start_date' => 'nullable|required_if:scope,date_range|date',
            'end_date' => 'nullable|required_if:scope,date_range|date|after_or_equal:start_date',
            'last_count' => 'nullable|required_if:scope,last_transactions|integer|min:1|max:10000',
        ]);

        $query = $this->filteredTransactionQuery($request);

        $this->applyExportScope($query, $validated);

        $transactions = $query
            ->orderBy('created_at', 'desc')
            ->get();

        $headers = [
            'Transaction ID',
            'Type',
            'Status',
            'Amount',
            'Fee',
            'Total Amount',
            'Sender Name',
            'Sender Email',
            'Receiver Name',
            'Receiver Email',
            'Description',
            'Created At',
        ];

        $rows = $transactions->map(function (Transaction $transaction) {
            return [
                $transaction->transaction_id ?? $transaction->id,
                $transaction->type_display,
                ucfirst($transaction->status),
                number_format((float) $transaction->amount, 2, '.', ''),
                number_format((float) ($transaction->fee ?? 0), 2, '.', ''),
                number_format((float) ($transaction->total_amount ?? $transaction->amount), 2, '.', ''),
                $transaction->sender->name ?? '-',
                $transaction->sender->email ?? '-',
                $transaction->receiver->name ?? '-',
                $transaction->receiver->email ?? '-',
                $this->getTransactionDescription($transaction),
                optional($transaction->created_at)->format('Y-m-d H:i:s'),
            ];
        });

        $filename = 'transactions-' . now()->format('Ymd-His') . '.' . $validated['format'];

        if ($validated['format'] === 'csv') {
            $responseHeaders = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            return response()->streamDownload(function () use ($headers, $rows) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, $headers);
                foreach ($rows as $row) {
                    fputcsv($handle, $row);
                }
                fclose($handle);
            }, $filename, $responseHeaders);
        }

        return SimpleXlsxExporter::download($headers, $rows->toArray(), $filename);
    }

    private function filteredTransactionQuery(Request $request): Builder
    {
        $query = Transaction::with(['sender', 'receiver']);

        if ($search = $request->input('search')) {
            $like = '%' . $search . '%';

            $query->where(function ($q) use ($like) {
                $q->where('transaction_id', 'like', $like)
                    ->orWhere('external_reference', 'like', $like)
                    ->orWhere('invoice_id', 'like', $like)
                    ->orWhereHas('sender', function ($senderQuery) use ($like) {
                        $senderQuery->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like);
                    })
                    ->orWhereHas('receiver', function ($receiverQuery) use ($like) {
                        $receiverQuery->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like);
                    });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($dateFrom = Carbon::make($request->input('date_from'))) {
            $query->where('created_at', '>=', $dateFrom->startOfDay());
        }

        if ($dateTo = Carbon::make($request->input('date_to'))) {
            $query->where('created_at', '<=', $dateTo->endOfDay());
        }

        return $query;
    }

    /**
     * @param array<string, mixed> $validated
     */
    private function applyExportScope(Builder $query, array $validated): void
    {
        $scope = $validated['scope'] ?? 'all';

        switch ($scope) {
            case 'last_days':
                $days = max(1, (int) ($validated['days'] ?? 7));
                $query->where('created_at', '>=', now()->subDays($days));
                break;
            case 'last_month':
                $query->where('created_at', '>=', now()->subMonth());
                break;
            case 'date_range':
                $start = Carbon::make($validated['start_date'] ?? null);
                $end = Carbon::make($validated['end_date'] ?? null);

                if ($start && $end) {
                    $query->whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()]);
                } elseif ($start) {
                    $query->where('created_at', '>=', $start->startOfDay());
                } elseif ($end) {
                    $query->where('created_at', '<=', $end->endOfDay());
                }
                break;
            case 'last_transactions':
                $count = max(1, (int) ($validated['last_count'] ?? 100));
                $query->orderBy('created_at', 'desc')->limit($count);
                break;
        }
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
