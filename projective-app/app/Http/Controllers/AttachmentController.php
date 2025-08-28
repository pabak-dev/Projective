<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function index(Task $task) {
        return $task->attachments;
    }

    public function store(Request $request, Task $task) {
        $request->validate(['file'=>'required|file|max:2048']);
        $file=$request->file('file');
        $path=$file->store('attachments','public');
        $attachment=$task->attachments()->create([
            'file_name'=>$file->getClientOriginalName(),
            'file_path'=>$path
        ]);
        return $attachment;
    }

    public function destroy(Attachment $attachment) {
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();
        return response()->json(['message'=>'Deleted']);
    }
}
