<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ProjectController extends Controller
{
    // 🔹 সব project list
    public function index()
    {
        return Auth::user()->projects()->with(['owner:id,name', 'members:id,name'])->latest()->get();
    }

    // 🔹 নতুন project create
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'version_control_link' => 'nullable|url|max:255',
        ]);

        $project = Project::create(array_merge($validated, ['user_id' => Auth::id()]));

        // Attach the user as a member with the 'owner' role
        $project->members()->attach(Auth::id(), ['role' => 'owner']);

        return response()->json($project->load('owner'), 201);
    }

    public function show(Project $project)
    {
        Gate::authorize('view', $project);
        return response()->json($project->load(['owner:id,name', 'members:id,name']));
    }

    public function update(Request $request, Project $project)
    {
        Gate::authorize('update', $project);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'version_control_link' => 'nullable|url|max:255',
        ]);

        $project->update($validated);

        return response()->json($project->load('owner:id,name', 'members:id,name'));
    }

    public function destroy(Project $project)
    {
        Gate::authorize('delete', $project);

        $project->delete();

        return response()->json(null, 204);
    }
}