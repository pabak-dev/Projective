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
            'project_id'  => $projectId,
            'title'       => $request->title,
            'status'      => $request->status,
            'priority'    => 'medium', // Default value on creation
            'type'        => 'task',     // Default value on creation
        ]);
        return response()->json($task->loadCount(['comments','attachments'])->load(['assignedUser:id,name']), 201);
    }

    public function show(Task $task)
    {
        return $task->loadCount(['comments', 'attachments'])->load(['assignedUser:id,name', 'comments.user:id,name', 'attachments']);
    }

    /**
     * Update task
     * THIS IS THE CORRECTED FUNCTION
     */
    public function update(Request $request, Task $task)
    {
        // We validate all possible fields that can be updated from the modal.
        // This is safer and explicitly allows 'priority' and 'type'.
        $validatedData = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status'      => 'sometimes|string',
            'due_date'    => 'sometimes|nullable|date',
            'assignee_id' => 'sometimes|nullable|exists:users,id',
            'priority'    => 'sometimes|string|in:low,medium,high',
            'type'        => 'sometimes|string|in:task,meeting,milestone',
        ]);
        
        $task->update($validatedData);

        return response()->json($task->loadCount(['comments','attachments'])->load(['assignedUser:id,name']));
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(null, 204);
    }

    public function assignUser(Request $request, Task $task)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);
        $task->assignee_id = $request->user_id;
        $task->save();
        return response()->json(['message' => 'User assigned successfully', 'task' => $task->loadCount(['comments','attachments'])->load(['assignedUser:id,name'])]);
    }

    public function unassignUser(Task $task)
    {
        $task->assignee_id = null;
        $task->save();
        return response()->json(['message' => 'User unassigned successfully', 'task' => $task->loadCount(['comments','attachments'])->load(['assignedUser:id,name'])]);
    }
}