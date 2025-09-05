<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    /**
     * Display the leaderboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // 1. Ensure a user is authenticated before proceeding.
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        // 2. Get the current user and the selected time period from the request.
        $currentUser = Auth::user();
        $period = $request->input('period', 'all_time');

        // 3. Build the main database query to rank users.
        // This query sums up points from the `users` table directly.
        // For a time-based filter, you would join a `point_logs` table here.
        $rankedUsers = User::query()
            ->select('id', 'name', 'role', 'avatar', 'points')
            ->orderBy('points', 'desc')
            ->get();

        // 4. Transform the user data for the frontend.
        $currentUserRank = 0;
        $topPerformers = $rankedUsers->map(function ($user, $key) use ($currentUser, &$currentUserRank) {
            $rank = $key + 1;
            $isCurrentUser = $user->id === $currentUser->id;

            if ($isCurrentUser) {
                $currentUserRank = $rank;
            }

            return [
                'rank' => $rank,
                'name' => $isCurrentUser ? 'You' : $user->name,
                'role' => $user->role ?? 'N/A',
                'points' => $user->points,
                'weeklyChange' => '+0 this week', // Placeholder for weekly change logic
                'avatar' => $user->avatar ?? 'https://i.pravatar.cc/150',
                'isCurrentUser' => $isCurrentUser,
            ];
        });

        // 5. Calculate real-time stats for the logged-in user.
        $tasksCompleted = Task::where('assignee_id', $currentUser->id)
                              ->where('status', 'done')
                              ->count();
        
        $totalPoints = $currentUser->points;
        $avgPointsPerTask = ($tasksCompleted > 0) ? round($totalPoints / $tasksCompleted) : 0;

        $userStats = [
            'totalPoints' => $totalPoints,
            'rank' => '#' . $currentUserRank,
            'tasksCompleted' => $tasksCompleted,
            'avgPointsPerTask' => $avgPointsPerTask,
        ];

        // 6. Load static data from the config file.
        $pointSystem = config('gamification.point_system');
        
        // This can be made dynamic later if needed.
        $achievements = [
            ['icon' => '🏆', 'title' => 'Speed Demon', 'description' => 'Complete 5 tasks early', 'earned' => true],
            ['icon' => '👀', 'title' => 'Code Reviewer', 'description' => 'Review 10 pull requests', 'earned' => true],
        ];

        // 7. Render the Inertia page with all the data.
        return Inertia::render('Leaderboard', [
            'topPerformers' => $topPerformers,
            'pointSystem' => $pointSystem,
            'achievements' => $achievements,
            'userStats' => $userStats,
            'period' => $period, // Pass the current period back to the frontend
        ]);
    }
}