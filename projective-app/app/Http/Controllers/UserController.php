<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return User::all();
    }

    /**
     * Display the specified user's public profile.
     */
    public function show(User $user)
    {
        // Eager load the user's projects and their assigned tasks
        $user->load(['projects', 'assignedTasks']);
        
        // --- THIS IS THE FIX ---
        // Change the key from 'user' to 'userProfile' to match the frontend.
        return Inertia::render('Profile/Show', [
            'userProfile' => $user
        ]);
    }
}