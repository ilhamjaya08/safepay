<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Wallet;

class QRController extends Controller
{
    public function receive()
    {
        $user = auth()->user();
        
        // Check if user is suspended or inactive
        if ($user->isSuspended() || !$user->is_active) {
            return redirect()->route('user.dashboard')
                ->with('error', 'Account suspended/inactive - QR operations not available');
        }
        
        $wallet = $user->wallet;

        if (!$wallet) {
            // Create wallet if doesn't exist
            $wallet = new Wallet();
            $wallet->user_id = $user->id;
            $wallet->wallet_number = $wallet->generateWalletNumber();
            $wallet->balance = '0.00';
            $wallet->save();
        }

        // Generate static QR data with wallet info
        $qrData = [
            'type' => 'wallet',
            'wallet_number' => $wallet->wallet_number,
            'user_id' => $user->id,
            'user_name' => $user->name
        ];

        return Inertia::render('User/QR/Receive', [
            'wallet' => $wallet,
            'qr_data' => base64_encode(json_encode($qrData))
        ]);
    }

    public function send()
    {
        return Inertia::render('User/QR/Send');
    }

    public function scanQR(Request $request)
    {
        $request->validate([
            'qr_data' => 'required|string'
        ]);

        $currentUser = auth()->user();
        
        try {
            // Try to decode as base64 JSON first
            $qrData = json_decode(base64_decode($request->qr_data), true);
            
            // If JSON decode fails, assume it's a wallet number
            if (!$qrData) {
                $walletNumber = $request->qr_data;
                $receiver = User::with('wallet')
                    ->whereHas('wallet', function($q) use ($walletNumber) {
                        $q->where('wallet_number', $walletNumber);
                    })
                    ->first();
            } else {
                // Validate QR data format
                if ($qrData['type'] !== 'wallet') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid QR Code format'
                    ], 400);
                }

                // Find by wallet number from QR data
                $receiver = User::with('wallet')
                    ->whereHas('wallet', function($q) use ($qrData) {
                        $q->where('wallet_number', $qrData['wallet_number']);
                    })
                    ->first();
            }
            
            if (!$receiver || !$receiver->wallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'User or wallet not found'
                ], 404);
            }

            if ($receiver->id === $currentUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot send money to yourself'
                ], 400);
            }

            if (!$receiver->is_active || $receiver->isSuspended()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Receiver account is inactive or suspended'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'receiver' => [
                    'id' => $receiver->id,
                    'name' => $receiver->name,
                    'wallet_number' => $receiver->wallet->wallet_number
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR Code'
            ], 400);
        }
    }
}
