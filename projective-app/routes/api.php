<?php

use App\Http\Controllers\AssistantController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\LeaderboardController; // Add this import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// This route should be public, as it's used to get an API token for a logged-in session user.
Route::middleware('auth:sanctum')->post('/auth/token', function (Request $request) {
    return response()->json([
        'token' => $request->user()->createToken("auth_token")->plainTextToken
    ]);
});

// Protected API routes that require an authenticated session.
Route::middleware('auth')->group(function () {
    // User Routes
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
    
    // Assistant Route
   // Route::post('/assistant/query', [AssistantController::class, 'query']);
    
    // Leaderboard Routes (moved inside the middleware group)
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);
    Route::get('/user-stats', [LeaderboardController::class, 'userStats']);
});