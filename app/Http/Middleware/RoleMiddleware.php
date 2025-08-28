<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        
        if ($user->role !== $role) {
            abort(403, 'Access denied. Insufficient privileges.');
        }

        if ($user->isSuspended()) {
            auth()->logout();
            return redirect()->route('login')->withErrors(['suspended' => 'Your account has been suspended.']);
        }

        return $next($request);
    }
}
