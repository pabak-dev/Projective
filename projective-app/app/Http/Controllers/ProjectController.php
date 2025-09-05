<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

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
        // Validation
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:active,archived,completed',
            'due_date'    => 'nullable|date',
        ]);

        $project = Project::create($validated);

        return response()->json($project, 201);
    }
}
