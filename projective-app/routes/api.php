<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// আপনার Inertia (React) অ্যাপের সব API রাউট web.php তে খুব সুন্দরভাবে ডিফাইন করা আছে।
// তাই রাউট কনফ্লিক্ট এড়াতে আমরা এখান থেকে ডুপ্লিকেট রাউটগুলো রিমুভ করে দিয়েছি।

// শুধুমাত্র এক্সটার্নাল কোনো অ্যাপের জন্য টোকেন জেনারেট করার রাউটটি এখানে রাখা হলো
Route::middleware('auth:sanctum')->post('/auth/token', function (Request $request) {
    return response()->json([
        'token' => $request->user()->createToken("auth_token")->plainTextToken
    ]);
});