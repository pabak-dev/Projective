<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use App\Models\UserAchievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class LeaderboardController extends Controller
{
   
    private $pointRules = [
        'tasks' => [
            'high_priority_or_story' => 25,
            'bug' => 15,
            'regular' => 10,
        ],
        'bonus' => [
            'early_completion' => 5,
            'code_review' => 3,
            'comments' => 1,
            'review_given' => 3,
        ]
    ];

    public function showLeaderboard(Request $request)
    {
       
        $period = $request->input('period', 'monthly');

        $leaderboardData = $this->getLeaderboardData($period);
        
        
        $userStats = $this->getUserStatsData($period, $leaderboardData);

        return inertia('Leaderboard', [
            'period' => $period, 
            'topPerformers' => $this->formatTopPerformers($leaderboardData, $period),
            'pointSystem' => $this->getDynamicPointSystem(),
            'achievements' => $this->formatAchievements($userStats['achievements']),
            'userStats' => [
                'totalPoints' => $userStats['totalPoints'],
                'rank' => $userStats['rank'] > 0 ? "#{$userStats['rank']}" : "#-",
                'tasksCompleted' => $userStats['tasksCompleted'],
                'avgPointsPerTask' => $userStats['avgPointsPerTask'],
            ]
        ]);
    }

   
    public function index(Request $request)
    {
        $period = $request->input('period', 'monthly');
        return response()->json($this->getLeaderboardData($period));
    }

    public function userStats(Request $request)
    {
        $period = $request->input('period', 'monthly');
        $leaderboardData = $this->getLeaderboardData($period);
        return response()->json($this->getUserStatsData($period, $leaderboardData));
    }

  private function getLeaderboardData($period)
    {
        $dates = $this->getDateRange($period);

        return User::where('name', '!=', 'Test User')
            ->with(['tasks' => function ($query) use ($dates) {
                $query->where('status', 'done');
                if ($dates) {
                    $query->whereBetween('updated_at', $dates);
                }
            }])
            ->get()
            ->map(function ($user) use ($period) {
                
                $totalPoints = $this->calculateUserPoints($user, $user->tasks);
                $weeklyPoints = $this->calculateWeeklyPoints($user);
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'Developer',
                    'totalPoints' => $totalPoints,
                    'weeklyPoints' => $weeklyPoints,
                    'tasksCompleted' => $user->tasks->count(),
                    'avatar' => $user->avatar, 
                ];
            })
            ->sortByDesc('totalPoints')
            ->values()
            ->toArray();
    }

    private function getUserStatsData($period, $leaderboardData)
    {
        $user = Auth::user();
        if (!$user) {
            return [
                'totalPoints' => 0, 'rank' => 0,
                'tasksCompleted' => 0, 'avgPointsPerTask' => 0, 'achievements' => []
            ];
        }

        $rankIndex = collect($leaderboardData)->search(function ($item) use ($user) {
            return $item['id'] === $user->id;
        });
        
        $rank = $rankIndex !== false ? $rankIndex + 1 : 0;

        $userData = collect($leaderboardData)->firstWhere('id', $user->id);
        
        $totalPoints = $userData ? $userData['totalPoints'] : 0;
        $completedTasks = $userData ? $userData['tasksCompleted'] : 0;
        $avgPointsPerTask = $completedTasks > 0 ? round($totalPoints / $completedTasks, 1) : 0;

        return [
            'totalPoints' => $totalPoints,
            'rank' => $rank,
            'tasksCompleted' => $completedTasks,
            'avgPointsPerTask' => $avgPointsPerTask,
            'achievements' => $this->getUserAchievements($user)
        ];
    }

    private function calculateUserPoints($user, $completedTasks)
    {
        $points = 0;
        
        foreach ($completedTasks as $task) {
            if ($task->priority === 'high' || $task->type === 'story') {
                $points += $this->pointRules['tasks']['high_priority_or_story'];
            } elseif ($task->type === 'bug') {
                $points += $this->pointRules['tasks']['bug'];
            } else {
                $points += $this->pointRules['tasks']['regular'];
            }

            if ($task->completed_at && $task->due_date) {
                if (new \DateTime($task->completed_at) < new \DateTime($task->due_date)) {
                    $points += $this->pointRules['bonus']['early_completion'];
                }
            }

            if ($task->reviews()->count() > 0) {
                $points += $this->pointRules['bonus']['code_review'];
            }
        }

        $points += $user->comments()->count() * $this->pointRules['bonus']['comments'];
        $points += $user->reviews()->count() * $this->pointRules['bonus']['review_given'];

        return $points;
    }

    private function calculateWeeklyPoints($user)
    {
        $dates = $this->getDateRange('weekly');
        
      
        $weeklyTasks = $user->tasks()
            ->where('status', 'done')
            ->whereBetween('updated_at', $dates)
            ->get();
            

        return $this->calculateUserPoints($user, $weeklyTasks);
    }

    private function getDateRange($period)
    {
        return match($period) {
            'weekly' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'monthly' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            default => null, 
        };
    }

    private function formatTopPerformers($leaderboardData, $period)
    {
        return collect($leaderboardData)->map(function ($user, $index) use ($period) {
            $changeText = $period === 'weekly' ? 'this week' : ($period === 'monthly' ? 'this month' : 'total');

            return [
                'id' => $user['id'],
                'rank' => $index + 1,
                'name' => $user['name'],
                'role' => $user['role'],
                'avatar' => $user['avatar'],
                'points' => $user['totalPoints'],
                'weeklyChange' => $user['weeklyPoints'] > 0 ? "+{$user['weeklyPoints']} {$changeText}" : "+0 {$changeText}",
                'isCurrentUser' => auth()->check() && $user['id'] === auth()->id(),
            ];
        })->toArray();
    }

    private function getDynamicPointSystem()
    {
        return [
            'taskCompletion' => [
                ['task' => 'Story / High Priority', 'points' => "{$this->pointRules['tasks']['high_priority_or_story']} pts"],
                ['task' => 'Bug Fix', 'points' => "{$this->pointRules['tasks']['bug']} pts"],
                ['task' => 'Regular Task', 'points' => "{$this->pointRules['tasks']['regular']} pts"],
            ],
            'bonusPoints' => [
                ['task' => 'Early Completion', 'points' => "+{$this->pointRules['bonus']['early_completion']} pts"],
                ['task' => 'Code Review', 'points' => "+{$this->pointRules['bonus']['code_review']} pts"],
                ['task' => 'Help Others / Comments', 'points' => "+{$this->pointRules['bonus']['comments']} pts"],
            ]
        ];
    }

   private function getUserAchievements($user)
    {
        $completedTasks = $user->tasks()->where('status', 'done')->get();
        
        $achievementDefinitions = [
            'Speed Demon' => [
                'description' => 'Complete tasks before deadline',
                'calculate' => function() use ($completedTasks) {
                    return $completedTasks->filter(function ($task) {
                        // Smart logic: completed_at না থাকলে updated_at দিয়ে চেক করবে
                        $doneDate = $task->completed_at ?? $task->updated_at;
                        if ($doneDate && $task->due_date) {
                            return new \DateTime($doneDate) <= new \DateTime($task->due_date);
                        }
                        return false;
                    })->count();
                },
                'base_target' => 3 // প্রতি ৩টি ফাস্ট টাস্কে ১ লেভেল আপ
            ],
            'Bug Hunter' => [
                'description' => 'Fix bugs and issues',
                'calculate' => function() use ($completedTasks) {
                    return $completedTasks->filter(function ($task) {
                        // Smart logic: টাস্কের টাইপ bug না হলেও টাইটেলে bug, fix বা issue থাকলে কাউন্ট হবে
                        return $task->type === 'bug' || 
                               stripos($task->title, 'bug') !== false || 
                               stripos($task->title, 'fix') !== false ||
                               stripos($task->title, 'issue') !== false;
                    })->count();
                },
                'base_target' => 2 // প্রতি ২টি বাগ ফিক্সে ১ লেভেল আপ
            ],
            'Team Player' => [
                'description' => 'Help team with comments',
                'calculate' => function() use ($user) {
                    return $user->comments()->count();
                },
                'base_target' => 5 // প্রতি ৫টি কমেন্টে ১ লেভেল আপ
            ],
            'Task Master' => [
                'description' => 'Complete assigned tasks',
                'calculate' => function() use ($completedTasks) {
                    return $completedTasks->count();
                },
                'base_target' => 10 // প্রতি ১০টি টাস্কে ১ লেভেল আপ
            ]
        ];

        $achievements = [];
        
        foreach ($achievementDefinitions as $name => $definition) {
            $currentProgress = $definition['calculate']();
            $baseTarget = $definition['base_target'];
            
            // Magic: Dynamic Leveling System 
            // টার্গেট পূরণ হয়ে গেলে অটোমেটিক নতুন টার্গেট সেট হবে!
            if ($currentProgress == 0) {
                $targetProgress = $baseTarget;
            } elseif ($currentProgress > 0 && $currentProgress % $baseTarget == 0) {
                $targetProgress = $currentProgress; // টার্গেটে হিট করলে বার 100% ফুল দেখাবে
            } else {
                $targetProgress = ceil($currentProgress / $baseTarget) * $baseTarget; // পরবর্তী টার্গেট
            }
            
            $isEarned = ($currentProgress > 0 && $currentProgress >= $targetProgress);
            
            
            $userAchievement = UserAchievement::updateOrCreate(
                ['user_id' => $user->id, 'achievement_name' => $name],
                [
                    'description' => $definition['description'],
                    'current_progress' => $currentProgress,
                    'target_progress' => $targetProgress,
                    'is_earned' => $isEarned,
                    'earned_at' => $isEarned ? now() : null
                ]
            );

           
            $level = ceil($targetProgress / $baseTarget);

            $achievements[] = [
                'name' => $name,
                'description' => "{$definition['description']} (Level {$level})", // লেভেল ডায়নামিক
                'earned' => $isEarned,
                'progress' => ['current' => $currentProgress, 'target' => $targetProgress],
                'earned_at' => $userAchievement->earned_at
            ];
        }

        return $achievements;
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
            'Speed Demon' => '⚡',
            'Code Reviewer' => '👀',
            'Bug Hunter' => '🐛',
            'Team Player' => '🤝',
        ];
        
        return $icons[$achievementName] ?? '🏆';
    }
}