<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserAchievement; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }

    public function show(User $user)
    {
        $completedTasks = $user->tasks()->where('status', 'done')->with('project:id,name')->get();
        $totalPoints = $this->calculateUserPoints($completedTasks);
        

        $achievements = $this->getUserAchievements($user);

        return Inertia::render('Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'Developer',
                'avatar' => $user->avatar,
            ],
            'stats' => [
                'totalTasks' => $user->tasks()->count(),
                'completedTasks' => $completedTasks->count(),
                'totalPoints' => $totalPoints,
            ],
            'achievements' => $this->formatAchievements($achievements),
            'completedTasks' => $completedTasks,
        ]);
    }

    private function calculateUserPoints($completedTasks)
    {
        $points = 0;
        foreach ($completedTasks as $task) {
            if ($task->priority === 'high' || $task->type === 'story') {
                $points += 25;
            } elseif ($task->type === 'bug') {
                $points += 15;
            } else {
                $points += 10;
            }
        }
        return $points;
    }

    private function formatAchievements($achievements)
    {
        return collect($achievements)->map(function ($achievement) {
            return [
                'title' => $achievement['name'],
                'description' => $achievement['description'],
                'icon' => $this->getAchievementIcon($achievement['name']),
                'earned' => $achievement['earned'],
                'progress' => $achievement['progress'],
                'earned_at' => $achievement['earned_at'] ?? null
            ];
        })->toArray();
    }

    private function getAchievementIcon($achievementName)
    {
        $icons = [
            'Speed Demon' => '💨',
            'Bug Hunter' => '🐛',
            'Team Player' => '🤝',
            'Task Master' => '🏆',
        ];
        
        return $icons[$achievementName] ?? '⭐';
    }

    private function getUserAchievements($user)
    {
        $completedTasks = $user->tasks()->where('status', 'done')->get();
        
        $achievementDefinitions = [
            'Speed Demon' => [
                'description' => 'Complete tasks before deadline',
                'calculate' => function() use ($completedTasks) {
                    return $completedTasks->filter(function ($task) {
                        if ($task->completed_at && $task->due_date) {
                            return new \DateTime($task->completed_at) < new \DateTime($task->due_date);
                        }
                        return false;
                    })->count();
                },
                'target' => max(3, ceil($completedTasks->count() * 0.3))
            ],
            'Bug Hunter' => [
                'description' => 'Fix bug tasks',
                'calculate' => function() use ($completedTasks) {
                    return $completedTasks->where('type', 'bug')->count();
                },
                'target' => max(3, ceil($completedTasks->count() * 0.2))
            ],
            'Team Player' => [
                'description' => 'Make helpful comments',
                'calculate' => function() use ($user) {
                    return $user->comments()->count();
                },
                'target' => max(10, $completedTasks->count() * 2)
            ],
            'Task Master' => [
                'description' => 'Complete tasks',
                'calculate' => function() use ($completedTasks) {
                    return $completedTasks->count();
                },
                'target' => max(10, 15)
            ]
        ];

        $achievements = [];
        
        foreach ($achievementDefinitions as $name => $definition) {
            $currentProgress = $definition['calculate']();
            $targetProgress = $definition['target'];
            $isEarned = $currentProgress >= $targetProgress;
            
            $userAchievement = UserAchievement::updateOrCreate(
                ['user_id' => $user->id, 'achievement_name' => $name],
                [
                    'description' => $definition['description'],
                    'current_progress' => $currentProgress,
                    'target_progress' => $targetProgress,
                    'is_earned' => $isEarned,
                    'earned_at' => $isEarned && !UserAchievement::where('user_id', $user->id)
                        ->where('achievement_name', $name)->where('is_earned', true)->exists() ? now() : null
                ]
            );

            $achievements[] = [
                'name' => $name,
                'description' => "{$definition['description']} ({$targetProgress} needed)",
                'earned' => $isEarned,
                'progress' => ['current' => $currentProgress, 'target' => $targetProgress],
                'earned_at' => $userAchievement->earned_at
            ];
        }
        return $achievements;
    }
}