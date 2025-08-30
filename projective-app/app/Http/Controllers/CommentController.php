<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // -------------------------------
    // Get all comments for a task
    // -------------------------------
    public function index(Task $task) {
        return response()->json(
            $task->comments()->with('user:id,name')->get()
        );
    }

    // -------------------------------
    // Store new comment
    // -------------------------------
    public function store(Request $request, Task $task) {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'content' => 'required|string'
        ]);

        $comment = $task->comments()->create([
            'user_id' => $request->user_id,
            'content' => $request->content
        ]);

        // return just the new comment with user
        return response()->json(
            $comment->load('user:id,name'),
            201
        );
    }

    // -------------------------------
    // Delete comment
    // -------------------------------
    public function destroy(Comment $comment) {
        $comment->delete();

        return response()->json(null, 204);
    }
}
