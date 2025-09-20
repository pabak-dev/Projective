<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAchievement extends Model
{
    protected $fillable = [
        'user_id', 'achievement_name', 'description', 
        'current_progress', 'target_progress', 'is_earned', 'earned_at'
    ];

    protected $casts = [
        'is_earned' => 'boolean',
        'earned_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
}