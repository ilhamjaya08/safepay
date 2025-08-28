<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckSuspendedUser
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        // Only check for regular users, not operators/managers
        if ($user && $user->role === 'user' && $user->isSuspended()) {
            $suspension = $user->suspensions()
                ->where('status', 'active')
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->latest()
                ->first();

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akun Anda telah disuspend',
                    'reason' => $suspension->reason ?? 'Tidak ada alasan yang diberikan',
                    'type' => $suspension->type ?? 'temporary',
                    'expires_at' => $suspension->expires_at,
                    'suspended_at' => $suspension->suspended_at
                ], 403);
            }

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return redirect()->route('login')
                ->with('error', 'Akun Anda telah disuspend. Alasan: ' . ($suspension->reason ?? 'Tidak ada alasan yang diberikan'));
        }

        return $next($request);
    }
}
