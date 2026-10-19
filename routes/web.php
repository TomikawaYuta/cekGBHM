<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GeneralRulesController;
use App\Http\Controllers\Admin\PanitiaController;
use App\Http\Controllers\Admin\QuestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Upload & Results Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/upload', [UploadController::class, 'index'])->name('upload.index');
    Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');
    Route::get('/upload/{uploadSession}', [UploadController::class, 'show'])->name('upload.show');

    Route::get('/results', [ResultController::class, 'index'])->name('results.index');
});

// Admin Routes
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('panitia', PanitiaController::class)->except(['show']);
    Route::resource('quest', QuestController::class)->except(['show']);
    Route::resource('rules', GeneralRulesController::class)->except(['show'])->parameters([
        'rules' => 'rule',
    ]);
});
