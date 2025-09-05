<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    // 🔹 ফাইল লিস্ট
    public function index(Task $task)
    {
        return response()->json(
            $task->attachments()->get()
        );
    }

    // 🔹 ফাইল আপলোড
    public function store(Request $request, Task $task)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,txt|max:5120',
        ]);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('attachments', 'public');

        $attachment = $task->attachments()->create([
            'file_name' => $uploadedFile->getClientOriginalName(),
            'file_path' => $path,
        ]);

        return response()->json($attachment, 201);
    }

    // 🔹 ফাইল ডাউনলোড
    public function download(Attachment $attachment)
    {
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }

    // 🔹 ফাইল ডিলিট
    public function destroy(Attachment $attachment)
    {
        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();

        return response()->json(null, 204);
    }
}
