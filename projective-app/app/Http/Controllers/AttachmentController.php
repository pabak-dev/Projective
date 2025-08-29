<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    // 🔹 ফাইল লিস্ট দেখা
    public function index(Task $task)
    {
        return $task->attachments()->get();
    }

    // 🔹 ফাইল আপলোড করা
   public function store(Request $request, Task $task)
{
    $request->validate([
        'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,txt|max:5120',
    ]);

    if ($request->hasFile('file')) {
        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('attachments', 'public');

        $attachment = new Attachment();
        $attachment->task_id = $task->id;
        $attachment->file_name = $uploadedFile->getClientOriginalName();
        $attachment->file_path = $path;
        $attachment->save();

        return response()->json($attachment, 201);
    }

    return response()->json(['error' => 'No file uploaded'], 400);
}



    // 🔹 ফাইল ডাউনলোড করা
    public function download(Attachment $attachment)
    {
        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }

    // 🔹 ফাইল ডিলিট করা
    public function destroy(Attachment $attachment)
    {
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted']);
    }
}
