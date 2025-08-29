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
public function store(Request $request, Task $task) {
    $comment = $task->comments()->create([
        'user_id' => $request->user_id,
        'content' => $request->content
    ]);

    // return task with updated counts
    return $task->loadCount(['comments','attachments'])->load('assignedUser');
}

public function destroy(Comment $comment) {
    $task = $comment->task;
    $comment->delete();

    return $task->loadCount(['comments','attachments'])->load('assignedUser');
}

}
