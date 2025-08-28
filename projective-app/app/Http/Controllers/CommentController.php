<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Task $task) {
        return $task->comments()->with('user:id,name')->get();
    }
public function store(Request $request, Task $task)
{
    $data = $request->validate([
        'user_id' => 'required|exists:users,id',
        'content' => 'required|string|max:1000',
    ]);

    $comment = $task->comments()->create($data);

    return response()->json($comment->load('user'), 201);
}


    public function destroy(Comment $comment) {
        $comment->delete();
        return response()->json(['message'=>'Deleted']);
    }
}
