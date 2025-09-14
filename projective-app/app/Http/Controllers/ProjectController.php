<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    // 🔹 সব project list
    public function index()
    {
        return response()->json(Project::all());
    }

    // 🔹 নতুন project create
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project = Auth::user()->projects()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'user_id' => Auth::id(), // Set the owner
        ]);

        // Attach the user as a member with the 'owner' role
        $project->members()->attach(Auth::id(), ['role' => 'owner']);


        return response()->json($project, 201);
    }
}
