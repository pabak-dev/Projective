<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // -------------------------------
    // Get all tasks for a project
    // -------------------------------
    public function index($projectId)
    {
        $tasks = Task::withCount(['comments','attachments'])
                     ->with('assignedUser:id,name')
                     ->where('project_id', $projectId)
                     ->get();

        return response()->json($tasks);
    }

    // -------------------------------
    // Create a new task
    // -------------------------------
    public function store(Request $request, $projectId)
    {
        $task = Task::create([
            'project_id'  => $projectId,
            'title'       => $request->title,
            'description' => $request->description,
            'status'      => $request->status,
            'due_date'    => $request->due_date,
            'assignee_id' => $request->assignee_id,
        ]);

        return response()->json(
            $task->loadCount(['comments','attachments'])
                 ->load(['assignedUser:id,name']),
            201
        );
    }

    // -------------------------------
    // Show single task (with relations)
    // -------------------------------
    public function show(Task $task)
    {
        return $task->loadCount(['comments','attachments'])
                    ->load([
                        'assignedUser:id,name',
                        'comments.user:id,name',
                        'attachments'
                    ]);
    }

    // -------------------------------
    // Update task
    // -------------------------------
    public function update(Request $request, Task $task)
    {
        $task->update($request->only([
            'title',
            'description',
            'status',
            'due_date',
            'assignee_id'
        ]));

        return response()->json(
            $task->loadCount(['comments','attachments'])
                 ->load(['assignedUser:id,name'])
        );
    }

    // -------------------------------
    // Delete task
    // -------------------------------
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(null, 204);
    }

    // -------------------------------
    // Assign user to task
    // -------------------------------
    public function assignUser(Request $request, Task $task)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $task->assignee_id = $request->user_id;
        $task->save();

        return response()->json([
            'message' => 'User assigned successfully',
            'task'    => $task->loadCount(['comments','attachments'])
                               ->load(['assignedUser:id,name'])
        ]);
    }

    // -------------------------------
    // Unassign user
    // -------------------------------
    public function unassignUser(Task $task)
    {
        $task->assignee_id = null;
        $task->save();

        return response()->json([
            'message' => 'User unassigned successfully',
            'task'    => $task->loadCount(['comments','attachments'])
                               ->load(['assignedUser:id,name'])
        ]);
    }
}
