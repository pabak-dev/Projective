<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Ensure user is properly loaded
        Auth::setUser(User::find(Auth::id()));
        $user = Auth::user();
        $user->load('projects');

        // 1. "My Tasks" Widget Data
        $myTasks = Task::where('assignee_id', $user->id)
            ->where('status', '!=', 'done')
            ->with('project:id,name')
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        // 2. "Project Health" Widget Data
        $projects = collect();
        if ($user->projects->isNotEmpty()) {
            $projects = Project::whereIn('id', $user->projects->pluck('id'))
                ->withCount([
                    'tasks',
                    'tasks as completed_tasks_count' => function ($query) {
                        $query->where('status', 'done');
                    }
                ])
                ->get()
                ->map(function ($project) {
                    $project->progress = $project->tasks_count > 0
                        ? round(($project->completed_tasks_count / $project->tasks_count) * 100)
                        : 0;
                    return $project;
                });
        }

        // 3. "Upcoming Deadlines" Widget Data
        $upcomingDeadlines = collect();
        if ($user->projects->isNotEmpty()) {
            $upcomingDeadlines = Task::whereIn('project_id', $user->projects->pluck('id'))
                ->where('due_date', '>=', now())
                ->where('due_date', '<=', now()->addWeek())
                ->orderBy('due_date', 'asc')
                ->limit(5)
                ->get();
        }

        // 4. "Recent Activity"
        $recentActivity = collect();
        if ($user->projects->isNotEmpty()) {
            $recentActivity = Task::whereIn('project_id', $user->projects->pluck('id'))
                ->where('updated_at', '>=', now()->subDays(3))
                ->with('assignedUser:id,name')
                ->orderBy('updated_at', 'desc')
                ->limit(5)
                ->get();
        }

        // 5. "Leaderboard" Widget Data
        $leaderboardUsers = User::where('name', '!=', 'Test User')
            ->with(['tasks' => function ($query) {
                $query->where('status', 'done')->with('project');
            }])
            ->get()
            ->map(function ($u) {
                $points = $this->calculateUserPoints($u);
                $weeklyPoints = $this->calculateWeeklyPoints($u);

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'avatar' => $u->avatar,
                    'points' => $points, // ✅ fixed (was totalPoints)
                    'weeklyPoints' => $weeklyPoints,
                    'tasksCompleted' => $u->tasks->count(),
                ];
            })
            ->sortByDesc('points')
            ->values();

        // Top 3 performers
        $topUsers = $leaderboardUsers->take(3)->values();

        // Current user rank
        $currentUserPoints = $this->calculateUserPoints($user);
        $userRank = $leaderboardUsers->search(function ($item) use ($user) {
            return $item['id'] === $user->id;
        });
        $userRank = $userRank === false ? $leaderboardUsers->count() + 1 : ($userRank + 1);

        return Inertia::render('Dashboard', [
            'myTasks' => $myTasks,
            'projects' => $projects,
            'upcomingDeadlines' => $upcomingDeadlines,
            'recentActivity' => $recentActivity,
            'leaderboard' => [
                'topUsers' => $topUsers,
                'currentUser' => [
                    'rank' => $userRank,
                    'points' => $currentUserPoints,
                ]
            ]
        ]);
    }

    /**
     * Calculate total points for a user
     */
    private function calculateUserPoints($user)
    {
        $points = 0;

        $completedTasks = $user->relationLoaded('tasks')
            ? $user->tasks
            : $user->tasks()->where('status', 'done')->get();

        foreach ($completedTasks as $task) {
            if (($task->priority ?? null) === 'high' || ($task->type ?? null) === 'story') {
                $points += 25;
            } elseif (($task->type ?? null) === 'bug') {
                $points += 15;
            } else {
                $points += 10;
            }

            // Early completion bonus
            if (!empty($task->completed_at) && !empty($task->due_date)) {
                try {
                    $completedDate = new \DateTime($task->completed_at);
                    $dueDate = new \DateTime($task->due_date);
                    if ($completedDate < $dueDate) {
                        $points += 5;
                    }
                } catch (\Exception $e) {
                    // ignore parsing errors
                }
            }

            // Reviews bonus
            if (method_exists($task, 'reviews')) {
                $points += $task->reviews()->count() > 0 ? 3 : 0;
            }
        }

        // Comments & reviews
        if (method_exists($user, 'comments')) {
            $points += $user->comments()->count();
        }
        if (method_exists($user, 'reviews')) {
            $points += $user->reviews()->count() * 3;
        }

        return $points;
    }

    /**
     * Calculate weekly points for a user
     */
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
            if (($task->priority ?? null) === 'high' || ($task->type ?? null) === 'story') {
                $points += 25;
            } elseif (($task->type ?? null) === 'bug') {
                $points += 15;
            } else {
                $points += 10;
            }
        }

        return $points;
    }
}
