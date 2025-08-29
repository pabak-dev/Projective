<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index($projectId)
    {
        $tasks = Task::withCount(['comments','attachments'])
                     ->with('assignedUser:id,name')
                     ->where('project_id', $projectId)
                     ->get();

        return response()->json($tasks);
    }

    public function store(Request $request, $projectId)
    {
        $task = Task::create([
            'project_id' => $projectId,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'due_date' => $request->due_date,
            'assignee_id' => $request->assignee_id,
        ]);

        return response()->json(
            $task->loadCount(['comments','attachments'])->load('assignedUser'),
            201
        );
    }

    public function show(Task $task)
    {
        return $task->loadCount(['comments','attachments'])
                    ->load(['assignedUser:id,name','comments.user:id,name','attachments']);
    }

    public function update(Request $request, Task $task)
    {
        $task->update($request->all());

        return response()->json(
            $task->loadCount(['comments','attachments'])->load('assignedUser')
        );
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(null, 204);
    }
    public function assignUser(\Illuminate\Http\Request $request, \App\Models\Task $task)
{
    $request->validate([
        'user_id' => 'required|exists:users,id',
    ]);

    $task->assignee_id = $request->user_id;
    $task->save();

    return response()->json([
        'message' => 'User assigned successfully',
        'task' => $task->load('assignee')
    ]);
}

public function unassignUser(\App\Models\Task $task)
{
    $task->assignee_id = null;
    $task->save();

    return response()->json([
        'message' => 'User unassigned successfully',
        'task' => $task
    ]);
}

}
