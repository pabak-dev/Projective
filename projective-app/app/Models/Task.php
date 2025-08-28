<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id','title','description','status','due_date','assignee_id'
    ];

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function assignee() {
        return $this->belongsTo(User::class,'assignee_id');
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function attachments() {
        return $this->hasMany(Attachment::class);
    }
}
