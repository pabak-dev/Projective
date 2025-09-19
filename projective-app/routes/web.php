<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\LeaderboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\CalendarController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/boards', function () {
        return Inertia::render('Boards');
    })->name('boards');

    Route::get('/analytics', function () {
        return Inertia::render('Analytics');
    })->name('analytics');

    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');

    // Fix: Use controller method instead of plain Inertia render
    Route::get('/leaderboard', [LeaderboardController::class, 'showLeaderboard'])->name('leaderboard');
    
    Route::post('/assistant/query', [App\Http\Controllers\AssistantController::class, 'query']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
});

Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/users', [UserController::class, 'index']);

    // Project Routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Project Member Routes
    Route::post('/projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::delete('/projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

    // Task Routes
    Route::get('/projects/{projectId}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{projectId}/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    Route::post('/tasks/{task}/assign', [TaskController::class, 'assignUser']);
    Route::post('/tasks/{task}/unassign', [TaskController::class, 'unassignUser']);

    // Comment Routes
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Attachment Routes
    Route::post('/tasks/{task}/attachments', [AttachmentController::class, 'store']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);
    
    // API routes for leaderboard data (if needed for AJAX calls)
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);
    Route::get('/user-stats', [LeaderboardController::class, 'userStats']);
});

require __DIR__.'/auth.php';