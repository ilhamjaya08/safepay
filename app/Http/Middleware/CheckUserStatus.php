<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // Only check for regular users, not operators/managers
        if (!$user || $user->role !== 'user') {
            return $next($request);
        }

        // Check if user is inactive
        if (!$user->is_active) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated. Please contact customer service.',
                    'status' => 'inactive'
                ], 403);
            }

            return Inertia::render('User/AccountBlocked', [
                'status' => 'inactive',
                'message' => 'Your account has been deactivated',
                'reason' => 'Your account access has been restricted by the administrator.',
                'contact_support' => true
            ]);
        }

        // Check if user is suspended
        if ($user->isSuspended()) {
            $suspension = $user->suspensions()
                ->where('status', 'active')
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })->first();

            if ($suspension) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your account is suspended: ' . $suspension->reason,
                        'status' => 'suspended',
                        'suspension' => [
                            'type' => $suspension->type,
                            'reason' => $suspension->reason,
                            'expires_at' => $suspension->expires_at,
                            'remaining_time' => $suspension->remaining_time
                        ]
                    ], 403);
                }

                return Inertia::render('User/AccountBlocked', [
                    'status' => 'suspended',
                    'message' => 'Your account has been suspended',
                    'reason' => $suspension->reason,
                    'suspension' => $suspension,
                    'contact_support' => true
                ]);
            }
        }

        return $next($request);
    }
}
