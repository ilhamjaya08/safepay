<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\UserSuspension;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    // Display users list for operators (limited view)
    public function operatorIndex(Request $request)
    {
        $users = User::with(['wallet', 'suspensions' => function($q) {
            $q->where('status', 'active');
        }])
        ->where('role', 'user')
        ->when($request->search, function($query) use ($request) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhereHas('wallet', function($wq) use ($request) {
                      $wq->where('wallet_number', 'like', '%' . $request->search . '%');
                  });
            });
        })
        ->when($request->status, function($query) use ($request) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'suspended') {
                $query->whereHas('suspensions', function($q) {
                    $q->where('status', 'active');
                });
            }
        })
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return Inertia::render('Operator/UserManagement', [
            'users' => $users,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    // Display users list for managers (full view)
    public function managerIndex(Request $request)
    {
        $users = User::with(['wallet', 'bankAccounts', 'suspensions' => function($q) {
            $q->where('status', 'active');
        }])
        ->when($request->search, function($query) use ($request) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhereHas('wallet', function($wq) use ($request) {
                      $wq->where('wallet_number', 'like', '%' . $request->search . '%');
                  });
            });
        })
        ->when($request->role, function($query) use ($request) {
            $query->where('role', $request->role);
        })
        ->when($request->status, function($query) use ($request) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'suspended') {
                $query->whereHas('suspensions', function($q) {
                    $q->where('status', 'active');
                });
            }
        })
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return Inertia::render('Manager/UserManagement', [
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'role'])
        ]);
    }

    // Suspend user (Operator & Manager)
    public function suspendUser(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'type' => 'required|in:temporary,permanent',
            'expires_at' => 'required_if:type,temporary|nullable|date|after:now'
        ]);

        DB::beginTransaction();
        try {
            // Create suspension record
            UserSuspension::create([
                'user_id' => $user->id,
                'suspended_by' => auth()->id(),
                'type' => $request->type,
                'reason' => $request->reason,
                'status' => 'active',
                'suspended_at' => now(),
                'expires_at' => $request->type === 'temporary' ? $request->expires_at : null
            ]);

            // Deactivate user
            $user->update(['is_active' => false]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'User suspended successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to suspend user: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'suspended_by' => auth()->id(),
                'request_data' => $request->all(),
                'exception' => $e->getTraceAsString()
            ]);
            
            // Check if it's a database connection issue
            if (str_contains($e->getMessage(), 'could not find driver') || 
                str_contains($e->getMessage(), 'Connection refused') ||
                str_contains($e->getMessage(), 'no such table')) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Database error: Please check database connection and run migrations',
                    'error_detail' => $e->getMessage()
                ], 500);
            }
            
            return response()->json([
                'success' => false, 
                'message' => 'Failed to suspend user: ' . $e->getMessage()
            ], 500);
        }
    }

    // Lift suspension (Operator & Manager)
    public function liftSuspension(Request $request, User $user)
    {
        DB::beginTransaction();
        try {
            // Lift active suspensions
            UserSuspension::where('user_id', $user->id)
                ->where('status', 'active')
                ->update([
                    'status' => 'lifted',
                    'lifted_by' => auth()->id()
                ]);

            // Reactivate user
            $user->update(['is_active' => true]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Suspension lifted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to lift suspension'], 500);
        }
    }

    // Toggle user active status (Manager only)
    public function toggleUserStatus(User $user)
    {
        if (auth()->user()->role !== 'manager') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);
        
        return response()->json([
            'success' => true, 
            'message' => 'User status updated successfully',
            'is_active' => $user->is_active
        ]);
    }

    // Top up wallet balance (Manager only)
    public function topUpWallet(Request $request, User $user)
    {
        if (auth()->user()->role !== 'manager') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'amount' => 'required|numeric|min:1000|max:100000000',
            'description' => 'nullable|string|max:255'
        ]);

        $wallet = $user->wallet;
        if (!$wallet) {
            return response()->json(['success' => false, 'message' => 'User wallet not found'], 404);
        }

        DB::beginTransaction();
        try {
            // Create topup transaction
            $transaction = Transaction::create([
                'transaction_id' => 'TXN' . date('Ymd') . strtoupper(Str::random(8)),
                'sender_id' => auth()->id(),
                'receiver_id' => $user->id,
                'type' => 'topup',
                'amount' => $request->amount,
                'fee' => 0,
                'total_amount' => $request->amount,
                'status' => 'completed',
                'metadata' => json_encode([
                    'topup_by' => auth()->user()->name,
                    'description' => $request->description ?? 'Manager topup'
                ])
            ]);

            // Add balance
            $wallet->addBalance($request->amount);

            DB::commit();
            return response()->json([
                'success' => true, 
                'message' => 'Top up completed successfully',
                'new_balance' => $wallet->fresh()->balance
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Top up failed: ' . $e->getMessage()], 500);
        }
    }

    // Update user details (Manager only)
    public function updateUser(Request $request, User $user)
    {
        if (auth()->user()->role !== 'manager') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $user->id,
            'role' => 'required|in:user,operator,manager'
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'role']));

        return response()->json(['success' => true, 'message' => 'User updated successfully']);
    }

    // Get user details
    public function getUserDetails(User $user)
    {
        $user->load(['wallet', 'bankAccounts', 'suspensions' => function($q) {
            $q->latest()->limit(5);
        }]);

        // Get recent transactions
        $recentTransactions = Transaction::where(function($query) use ($user) {
            $query->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
        })
        ->with(['sender', 'receiver'])
        ->latest()
        ->limit(10)
        ->get();

        return response()->json([
            'user' => $user,
            'recent_transactions' => $recentTransactions
        ]);
    }
}
