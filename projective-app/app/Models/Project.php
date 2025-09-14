<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'user_id'];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')->withPivot('role')->withTimestamps();
    }
}
