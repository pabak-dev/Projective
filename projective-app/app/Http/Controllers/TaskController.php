<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index($projectId) {
        $tasks = Task::withCount(['comments','attachments'])
                     ->with('assignee:id,name')
                     ->where('project_id',$projectId)
                     ->get();
        return response()->json($tasks);
    }

    public function store(Request $request,$projectId) {
        $task = Task::create([
            'project_id'=>$projectId,
            'title'=>$request->title,
            'description'=>$request->description,
            'status'=>$request->status ?? 'todo',
            'due_date'=>$request->due_date,
            'assignee_id'=>$request->assignee_id,
        ]);
        return response()->json($task->load('assignee'),201);
    }

    public function show(Task $task) {
        return response()->json($task->load(['assignee:id,name','comments.user:id,name','attachments']));
    }

    public function update(Request $request, Task $task) {
        $task->update($request->all());
        return response()->json($task->load('assignee'));
    }

    public function destroy(Task $task) {
        $task->delete();
        return response()->json(null,204);
    }
}
