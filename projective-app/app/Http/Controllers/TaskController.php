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
    $validatedData = $request->validate([
        'title'       => 'sometimes|string|max:255',
        'description' => 'sometimes|nullable|string',
        'status'      => 'sometimes|string',
        'due_date'    => 'sometimes|nullable|date',
        'assignee_id' => 'sometimes|nullable|exists:users,id',
        'priority'    => 'sometimes|string|in:low,medium,high',
        'type'        => 'sometimes|string|in:task,bug,story',
    ]);
    
    // Set completed_at when task status changes to 'done'
    if (isset($validatedData['status'])) {
        if ($validatedData['status'] === 'done' && $task->status !== 'done') {
            $validatedData['completed_at'] = now();
        } elseif ($validatedData['status'] !== 'done') {
            $validatedData['completed_at'] = null;
        }
    }
    
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

        return response()->json(
            $task->loadCount(['comments','attachments'])
                 ->load(['assignedUser:id,name'])
        );
    }

    public function unassignUser(Task $task)
    {
        $task->assignee_id = null;
        $task->save();

        return response()->json(
            $task->loadCount(['comments','attachments'])
                 ->load(['assignedUser:id,name'])
        );
    }
}