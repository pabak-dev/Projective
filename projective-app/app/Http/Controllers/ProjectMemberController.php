<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectMemberController extends Controller
{
    public function store(Request $request, Project $project)
    {
        Gate::authorize('update', $project);

        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $project->members()->syncWithoutDetaching($data['user_id']);

        return response()->json($project->load('members:id,name')->members);
    }

    public function destroy(Project $project, User $user)
    {
        Gate::authorize('update', $project);

        if ($project->user_id === $user->id) {
            return response()->json(['message' => 'Cannot remove the project owner.'], 403);
        }

        $project->members()->detach($user->id);

        return response()->json($project->load('members:id,name')->members);
    }
}