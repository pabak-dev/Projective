<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index() {
        return response()->json(Project::all());
    }

    public function store(Request $request) {
        $project = Project::create($request->all());
        return response()->json($project, 201);
    }
}
