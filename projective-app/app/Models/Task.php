<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'due_date',
        'assignee_id',
    ];

    // 🔹 Project relation
    public function project() {
        return $this->belongsTo(Project::class);
    }

    // 🔹 Comments relation
    public function comments() {
        return $this->hasMany(Comment::class);
    }

    // 🔹 Attachments relation
    public function attachments() {
        return $this->hasMany(Attachment::class);
    }

    // 🔹 Assigned user relation
    public function assignedUser() {
        return $this->belongsTo(User::class, 'assignee_id')
                    ->select('id', 'name'); // শুধু id আর name
    }
}
