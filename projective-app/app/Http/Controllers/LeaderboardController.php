<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    // For API calls
    public function index()
    {
        $users = User::where('name', '!=', 'Test User') // Exclude Test User
            ->withCount(['tasks as completed_tasks' => function ($query) {
                $query->where('status', 'done');
            }])
            ->with(['tasks' => function ($query) {
                $query->where('status', 'done')->with(['project']);
            }])
            ->get()
            ->map(function ($user) {
                $totalPoints = $this->calculateUserPoints($user);
                $weeklyPoints = $this->calculateWeeklyPoints($user);
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'Developer',
                    'totalPoints' => $totalPoints,
                    'weeklyPoints' => $weeklyPoints,
                    'tasksCompleted' => $user->completed_tasks,
                    'avatar' => $user->avatar,
                ];
            })
            ->sortByDesc('totalPoints')
            ->values()
            ->toArray();

        return response()->json($users);
    }

    public function userStats(Request $request)
    {
        $user = Auth::user();
        $totalPoints = $this->calculateUserPoints($user);
        $weeklyPoints = $this->calculateWeeklyPoints($user);
        
        $rank = User::where('name', '!=', 'Test User') // Exclude Test User
            ->withCount(['tasks as completed_tasks' => function ($query) {
                $query->where('status', 'done');
            }])
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'totalPoints' => $this->calculateUserPoints($u)
                ];
            })
            ->sortByDesc('totalPoints')
            ->values()
            ->search(function ($item) use ($user) {
                return $item['id'] === $user->id;
            }) + 1;

        $completedTasks = $user->tasks()->where('status', 'done')->count();
        $avgPointsPerTask = $completedTasks > 0 ? round($totalPoints / $completedTasks, 1) : 0;
        $achievements = $this->getUserAchievements($user);

        return response()->json([
            'totalPoints' => $totalPoints,
            'weeklyPoints' => $weeklyPoints,
            'rank' => $rank,
            'tasksCompleted' => $completedTasks,
            'avgPointsPerTask' => $avgPointsPerTask,
            'achievements' => $achievements
        ]);
    }

    // For Inertia page
    public function showLeaderboard()
    {
        $leaderboardData = $this->getLeaderboardData();
        $userStats = $this->getUserStatsData();
        
        return inertia('Leaderboard', [
            'topPerformers' => $this->formatTopPerformers($leaderboardData),
            'pointSystem' => [
                'taskCompletion' => [
                    ['task' => 'Story Point', 'points' => '25 pts'],
                    ['task' => 'Bug Fix', 'points' => '15 pts'],
                    ['task' => 'Regular Task', 'points' => '10 pts'],
                ],
                'bonusPoints' => [
                    ['task' => 'Early Completion', 'points' => '+5 pts'],
                    ['task' => 'Code Review', 'points' => '+3 pts'],
                    ['task' => 'Help Others', 'points' => '+2 pts'],
                ]
            ],
            'achievements' => $this->formatAchievements($userStats['achievements']),
            'userStats' => [
                'totalPoints' => $userStats['totalPoints'],
                'rank' => "#{$userStats['rank']}",
                'tasksCompleted' => $userStats['tasksCompleted'],
                'avgPointsPerTask' => $userStats['avgPointsPerTask'],
            ]
        ]);
    }

    private function getLeaderboardData()
    {
        $users = User::where('name', '!=', 'Test User') // Exclude Test User
            ->withCount(['tasks as completed_tasks' => function ($query) {
                $query->where('status', 'done');
            }])
            ->with(['tasks' => function ($query) {
                $query->where('status', 'done')->with(['project']);
            }])
            ->get()
            ->map(function ($user) {
                $totalPoints = $this->calculateUserPoints($user);
                $weeklyPoints = $this->calculateWeeklyPoints($user);
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'Developer',
                    'totalPoints' => $totalPoints,
                    'weeklyPoints' => $weeklyPoints,
                    'tasksCompleted' => $user->completed_tasks,
                    'avatar' => $user->avatar,
                ];
            })
            ->sortByDesc('totalPoints')
            ->values()
            ->toArray();

        return $users;
    }

    private function getUserStatsData()
    {
        $user = Auth::user();
        if (!$user) {
            return [
                'totalPoints' => 0, 'weeklyPoints' => 0, 'rank' => 0,
                'tasksCompleted' => 0, 'avgPointsPerTask' => 0, 'achievements' => []
            ];
        }

        $totalPoints = $this->calculateUserPoints($user);
        $weeklyPoints = $this->calculateWeeklyPoints($user);
        
        $rank = User::where('name', '!=', 'Test User') // Exclude Test User
            ->withCount(['tasks as completed_tasks' => function ($query) {
                $query->where('status', 'done');
            }])
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'totalPoints' => $this->calculateUserPoints($u)
                ];
            })
            ->sortByDesc('totalPoints')
            ->values()
            ->search(function ($item) use ($user) {
                return $item['id'] === $user->id;
            }) + 1;

        $completedTasks = $user->tasks()->where('status', 'done')->count();
        $avgPointsPerTask = $completedTasks > 0 ? round($totalPoints / $completedTasks, 1) : 0;
        $achievements = $this->getUserAchievements($user);

        return [
            'totalPoints' => $totalPoints,
            'weeklyPoints' => $weeklyPoints,
            'rank' => $rank,
            'tasksCompleted' => $completedTasks,
            'avgPointsPerTask' => $avgPointsPerTask,
            'achievements' => $achievements
        ];
    }

    private function formatTopPerformers($leaderboardData)
    {
        return collect($leaderboardData)->map(function ($user, $index) {
            return [
                'id' => $user['id'],
                'rank' => $index + 1,
                'name' => $user['name'],
                'role' => $user['role'],
                'avatar' => $user['avatar'],
                'points' => $user['totalPoints'],
                'weeklyChange' => $user['weeklyPoints'] > 0 ? "+{$user['weeklyPoints']} this week" : "+0 this week",
                'isCurrentUser' => auth()->check() && $user['id'] === auth()->id(),
            ];
        })->toArray();
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
            'Code Reviewer' => '👀',
            'Bug Hunter' => '🐛',
            'Team Player' => '🤝',
        ];
        
        return $icons[$achievementName] ?? '🏆';
    }

    private function calculateUserPoints($user)
    {
        $points = 0;
        $completedTasks = $user->tasks()->where('status', 'done')->get();
        
        foreach ($completedTasks as $task) {
            if ($task->priority === 'high' || $task->type === 'story') {
                $points += 25;
            } elseif ($task->type === 'bug') {
                $points += 15;
            } else {
                $points += 10;
            }

            if ($task->completed_at && $task->due_date) {
                $completedDate = new \DateTime($task->completed_at);
                $dueDate = new \DateTime($task->due_date);
                
                if ($completedDate < $dueDate) {
                    $points += 5;
                }
            }

            if ($task->reviews()->count() > 0) {
                $points += 3;
            }
        }

        $points += $user->comments()->count();
        $points += $user->reviews()->count() * 3;

        return $points;
    }

    private function calculateWeeklyPoints($user)
    {
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        
        $weeklyTasks = $user->tasks()
            ->where('status', 'done')
            ->whereBetween('updated_at', [$startOfWeek, $endOfWeek])
            ->get();
            
        $points = 0;
        foreach ($weeklyTasks as $task) {
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
                        ->where('achievement_name', $name)
                        ->where('is_earned', true)
                        ->exists() ? now() : null
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