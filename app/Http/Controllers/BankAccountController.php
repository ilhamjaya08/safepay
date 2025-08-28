<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BankAccount;
use App\Models\User;

class BankAccountController extends Controller
{
    public function apply()
    {
        $user = auth()->user();
        
        // Check if user already has a bank account application
        $existingApplication = BankAccount::where('user_id', $user->id)->first();
        
        return Inertia::render('User/BankAccount/Apply', [
            'existingApplication' => $existingApplication,
            'supportedAccountTypes' => BankAccount::getSupportedAccountTypes(),
            'branches' => BankAccount::getBranches()
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        // Check if user is suspended or inactive
        if ($user->isSuspended() || !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account suspended/inactive - cannot apply for bank account'
            ], 403);
        }
        
        // Check if user already has a bank account
        $existingAccount = BankAccount::where('user_id', $user->id)->first();
        if ($existingAccount) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a bank account application'
            ], 400);
        }

        $request->validate([
            'account_type' => 'required|string|in:' . implode(',', array_keys(BankAccount::getSupportedAccountTypes())),
            'branch_code' => 'required|string|in:' . implode(',', array_keys(BankAccount::getBranches())),
            'account_number' => 'required|string|min:6|max:12|unique:bank_accounts,account_number',
            'account_holder_name' => 'required|string|max:255',
            'id_card_number' => 'required|string|min:16|max:16|unique:bank_accounts,id_card_number',
            'date_of_birth' => 'required|date',
            'address' => 'required|string|max:500',
            'phone_number' => 'required|string|min:10|max:15',
            'mother_maiden_name' => 'required|string|max:255'
        ]);

        $bankAccount = BankAccount::create([
            'user_id' => $user->id,
            'account_type' => $request->account_type,
            'account_prefix' => 'SP',
            'branch_code' => $request->branch_code,
            'account_number' => $request->account_number,
            'account_holder_name' => $request->account_holder_name,
            'id_card_number' => $request->id_card_number,
            'date_of_birth' => $request->date_of_birth,
            'address' => $request->address,
            'phone_number' => $request->phone_number,
            'mother_maiden_name' => $request->mother_maiden_name,
            'status' => 'pending',
            'is_primary' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bank account application submitted successfully',
            'application' => $bankAccount
        ]);
    }

    public function status()
    {
        $user = auth()->user();
        $application = BankAccount::where('user_id', $user->id)->first();

        return Inertia::render('User/BankAccount/Status', [
            'application' => $application
        ]);
    }

    // For Operators and Managers
    public function pendingApplications()
    {
        $applications = BankAccount::with(['user'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($applications);
    }

    public function review(Request $request, BankAccount $bankAccount)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'rejection_reason' => 'required_if:action,reject|string|max:500'
        ]);

        $user = auth()->user();

        if (!$user->isOperator() && !$user->isManager()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($bankAccount->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This application has already been reviewed'
            ], 400);
        }

        if ($request->action === 'approve') {
            $bankAccount->update([
                'status' => 'approved',
                'is_verified' => true,
                'verified_at' => now(),
                'reviewed_at' => now(),
                'reviewed_by' => $user->id
            ]);

            $message = 'Bank account application approved successfully';
        } else {
            $bankAccount->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'reviewed_at' => now(),
                'reviewed_by' => $user->id
            ]);

            $message = 'Bank account application rejected';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'application' => $bankAccount->load(['user', 'reviewer'])
        ]);
    }

    public function allApplications()
    {
        $applications = BankAccount::with(['user', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($applications);
    }
}
