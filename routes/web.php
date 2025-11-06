<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QRController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

// Default dashboard redirect
Route::get('/dashboard', function () {
    $user = auth()->user();
    
    switch ($user->role) {
        case 'user':
            return redirect()->route('user.dashboard');
        case 'operator':
            return redirect()->route('operator.dashboard');
        case 'manager':
            return redirect()->route('manager.dashboard');
        default:
            return redirect()->route('user.dashboard');
    }
})->middleware(['auth', 'verified'])->name('dashboard');

// Role-specific dashboards
Route::middleware(['auth', 'verified', 'role:user', 'user.status', 'check.suspended'])->group(function () {
    Route::get('/user/dashboard', [DashboardController::class, 'userDashboard'])->name('user.dashboard');
    
    // QR functionality
    Route::prefix('qr')->name('user.qr.')->group(function () {
        Route::get('/receive', [QRController::class, 'receive'])->name('receive');
        Route::get('/send', [QRController::class, 'send'])->name('send');
        Route::post('/scan', [QRController::class, 'scanQR'])->name('scan');
    });
    
    // Transfer functionality
    Route::prefix('transfer')->name('user.transfer.')->group(function () {
        Route::get('/', [TransferController::class, 'index'])->name('index');
        Route::get('/qr/{invoiceId?}', [TransferController::class, 'qrTransfer'])->name('qr');
        Route::post('/validate-receiver', [TransferController::class, 'validateReceiver'])->name('validate');
        Route::post('/process', [TransferController::class, 'processTransfer'])->name('process');
        Route::post('/by-wallet', [\App\Http\Controllers\TransferAccountController::class, 'transferByAccountNumber'])->name('wallet');
        Route::post('/search-wallet', [\App\Http\Controllers\TransferAccountController::class, 'searchWallet'])->name('search');
    });

    // Bank Account functionality
    Route::prefix('bank-account')->name('user.bank.')->group(function () {
        Route::get('/apply', [BankAccountController::class, 'apply'])->name('apply');
        Route::post('/apply', [BankAccountController::class, 'store'])->name('store');
        Route::get('/status', [BankAccountController::class, 'status'])->name('status');
    });
});

Route::middleware(['auth', 'verified', 'role:operator'])->group(function () {
    Route::get('/operator/dashboard', [DashboardController::class, 'operator'])->name('operator.dashboard');
    Route::get('/operator/bank-applications', function() {
        return Inertia::render('Operator/BankApplications');
    })->name('operator.bank.applications');
    
    // User Management for Operators
    Route::prefix('operator/users')->name('operator.users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'operatorIndex'])->name('index');
        Route::get('/{user}/details', [UserManagementController::class, 'getUserDetails'])->name('details');
        Route::post('/{user}/suspend', [UserManagementController::class, 'suspendUser'])->name('suspend');
        Route::post('/{user}/lift-suspension', [UserManagementController::class, 'liftSuspension'])->name('lift-suspension');
    });
    
    // Bank Account Review API - with operator prefix
    Route::prefix('operator/bank-applications')->name('operator.bank.')->group(function () {
        Route::get('/pending', [BankAccountController::class, 'pendingApplications'])->name('pending');
        Route::post('/{bankAccount}/review', [BankAccountController::class, 'review'])->name('review');
        Route::get('/all', [BankAccountController::class, 'allApplications'])->name('all');
    });
});

Route::middleware(['auth', 'verified', 'role:manager'])->group(function () {
    Route::get('/manager/dashboard', [DashboardController::class, 'manager'])->name('manager.dashboard');
    Route::get('/manager/activities', [DashboardController::class, 'managerActivities'])->name('manager.activities');
    Route::get('/manager/activities/export', [DashboardController::class, 'exportManagerActivities'])->name('manager.activities.export');
    Route::get('/manager/bank-applications', function() {
        return Inertia::render('Operator/BankApplications'); // Same component as operator
    })->name('manager.bank.applications');
    
    // User Management for Managers (full access)
    Route::prefix('manager/users')->name('manager.users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'managerIndex'])->name('index');
        Route::get('/{user}/details', [UserManagementController::class, 'getUserDetails'])->name('details');
        Route::post('/{user}/suspend', [UserManagementController::class, 'suspendUser'])->name('suspend');
        Route::post('/{user}/lift-suspension', [UserManagementController::class, 'liftSuspension'])->name('lift-suspension');
        Route::post('/{user}/toggle-status', [UserManagementController::class, 'toggleUserStatus'])->name('toggle-status');
        Route::post('/{user}/topup', [UserManagementController::class, 'topUpWallet'])->name('topup');
        Route::put('/{user}/update', [UserManagementController::class, 'updateUser'])->name('update');
    });
    
    // Bank Account Review API - with manager prefix
    Route::prefix('manager/bank-applications')->name('manager.bank.')->group(function () {
        Route::get('/pending', [BankAccountController::class, 'pendingApplications'])->name('pending');
        Route::post('/{bankAccount}/review', [BankAccountController::class, 'review'])->name('review');
        Route::get('/all', [BankAccountController::class, 'allApplications'])->name('all');
    });
});

Route::middleware(['auth', 'check.suspended'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
