<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// ## Public Route ##
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ## Authenticated Routes ##
// Routes in this group require the user to be logged in.
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Boards Page
    Route::get('/boards', function () {
        return Inertia::render('Boards');
    })->name('boards');
    
    // Analytics Page
    Route::get('/analytics', function () {
        return Inertia::render('Analytics');
    })->name('analytics');

    // Calendar Page (uses a controller to fetch data)
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');

    // Leaderboard Page (uses a controller to fetch data)
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');

    // User Profile Page
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// This file contains all the necessary routes for authentication (login, register, etc.)
require __DIR__.'/auth.php';