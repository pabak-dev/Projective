<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\AttachmentController;

// Projects
Route::get('/projects',[ProjectController::class,'index']);
Route::post('/projects',[ProjectController::class,'store']);

// Tasks
Route::get('/projects/{project}/tasks',[TaskController::class,'index']);
Route::post('/projects/{project}/tasks',[TaskController::class,'store']);
Route::put('/tasks/{task}',[TaskController::class,'update']);
Route::delete('/tasks/{task}',[TaskController::class,'destroy']);

// Comments
Route::get('/tasks/{task}/comments',[CommentController::class,'index']);
Route::post('/tasks/{task}/comments',[CommentController::class,'store']);
Route::delete('/comments/{comment}',[CommentController::class,'destroy']);

// Attachments
Route::get('/tasks/{task}/attachments',[AttachmentController::class,'index']);
Route::post('/tasks/{task}/attachments',[AttachmentController::class,'store']);
Route::delete('/attachments/{attachment}',[AttachmentController::class,'destroy']);
