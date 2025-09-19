<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $projectId = $request->input('project_id');
        $period = $request->input('period', '30');

        $startDate = now()->subDays($period);

        $taskQuery = Task::query()->where('created_at', '>=', $startDate);
        if ($projectId) {
            $taskQuery->where('project_id', $projectId);
        }

        $totalTasks = (clone $taskQuery)->count();
        $completedTasks = (clone $taskQuery)->where('status', 'done')->count();
        $inProgressTasks = (clone $taskQuery)->where('status', 'in_progress')->count();

        $avgCycleTime = (clone $taskQuery)->where('status', 'done')
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(DATEDIFF(completed_at, created_at)) as avg_cycle_time')
            ->value('avg_cycle_time');

        // Restoring your robust avatar logic here
       // eager load only what we need and ensure avatar/name are selected
$recentTasksQuery = Task::with(['assignedUser' => function ($q) {
    $q->select('id', 'name', 'avatar');
}])->whereHas('assignedUser');

if ($projectId) {
    $recentTasksQuery->where('project_id', $projectId);
}

$recentTasks = $recentTasksQuery->latest('updated_at')->take(5)->get();

$recentActivities = $recentTasks->map(function ($task) {
    $action = 'updated';
    if ($task->wasRecentlyCreated) {
        $action = 'created';
    } elseif ($task->status === 'done' && $task->getOriginal('status') !== 'done') {
        $action = 'completed';
    }

    $assignedUser = $task->assignedUser;

    // make avatar an absolute URL if possible, otherwise null
    $avatar = null;
    if ($assignedUser && $assignedUser->avatar) {
        // Storage::url may return '/storage/...' so wrap with url()/asset()
        $avatar = asset(Storage::url($assignedUser->avatar));
    }

    return [
        'user' => $assignedUser ? $assignedUser->name : 'Unknown',
        'action' => "{$action} task \"{$task->title}\"",
        'time' => Carbon::parse($task->updated_at)->diffForHumans(),
        'status' => ucfirst($task->status),
        'avatar' => $avatar,
    ];
})->values(); // normalize indexes for JSON

        // Team Performance - Updated to exclude 'Test User'
        $teamQuery = User::where('name', '!=', 'Test User');
        if ($projectId) {
            $teamQuery->whereHas('projects', function ($q) use ($projectId) {
                $q->where('projects.id', $projectId);
            });
        }
        $teamPerformance = $teamQuery->withCount(['tasks as tasksCompleted' => function ($query) use ($projectId, $startDate) {
                $query->where('status', 'done')->where('completed_at', '>=', $startDate);
                if ($projectId) {
                    $query->where('project_id', $projectId);
                }
            }])
            ->orderBy('tasksCompleted', 'desc')
            ->take(5)
            ->get()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'role' => $user->role ?? 'Developer',
                    'tasksCompleted' => $user->tasksCompleted,
                    'avatar' => $user->avatar ? asset(Storage::url($user->avatar)) : null,

                ];
            });

        $taskDistribution = (clone $taskQuery)->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $taskFlowQuery = (clone $taskQuery);
        $taskFlow = $taskFlowQuery
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as created'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()->keyBy('date');
        
        $completedFlowQuery = (clone $taskQuery)->where('status', 'done');
        $completedFlow = $completedFlowQuery
            ->select(DB::raw('DATE(completed_at) as date'), DB::raw('count(*) as completed'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()->keyBy('date');

        $dates = collect();
        for ($i = $period - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dates->push([
                'date' => $date,
                'created' => $taskFlow[$date]['created'] ?? 0,
                'completed' => $completedFlow[$date]['completed'] ?? 0,
            ]);
        }

        return inertia('Analytics', [
            'metrics' => [
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks,
                'inProgressTasks' => $inProgressTasks,
                'avgCycleTime' => round($avgCycleTime, 1),
            ],
            'recentActivities' => $recentActivities,
            'teamPerformance' => $teamPerformance,
            'taskDistribution' => $taskDistribution,
            'taskFlow' => $dates,
            'projects' => Project::all(['id', 'name']),
            'currentProjectId' => $projectId,
            'currentPeriod' => $period,
        ]);
    }
    
    public function exportReport(Request $request)
    {
        $projectId = $request->input('project_id');
        $period = $request->input('period', '30');
        $startDate = now()->subDays($period);

        $taskQuery = Task::query()->where('created_at', '>=', $startDate);
        if ($projectId) {
            $taskQuery->where('project_id', $projectId);
        }
        
        $metrics = [
            'totalTasks' => (clone $taskQuery)->count(),
            'completedTasks' => (clone $taskQuery)->where('status', 'done')->count(),
            'inProgressTasks' => (clone $taskQuery)->where('status', 'in_progress')->count(),
            'avgCycleTime' => round((clone $taskQuery)->where('status', 'done')->whereNotNull('completed_at')->selectRaw('AVG(DATEDIFF(completed_at, created_at)) as time')->value('time'), 1),
        ];

        $teamQuery = User::where('name', '!=', 'Test User');
        if ($projectId) {
            $teamQuery->whereHas('projects', function ($q) use ($projectId) {
                $q->where('projects.id', $projectId);
            });
        }
        $teamPerformance = $teamQuery->withCount(['tasks as tasksCompleted' => function ($query) use ($projectId, $startDate) {
            $query->where('status', 'done')->where('completed_at', '>=', $startDate);
            if ($projectId) {
                $query->where('project_id', $projectId);
            }
        }])->orderBy('tasksCompleted', 'desc')->take(10)->get()->map(fn ($user) => [
            'name' => $user->name,
            'role' => $user->role ?? 'Developer',
            'tasksCompleted' => $user->tasksCompleted,
        ]);

        $taskDistribution = (clone $taskQuery)->select('status', DB::raw('count(*) as count'))->groupBy('status')->pluck('count', 'status');

        $projectName = $projectId ? Project::find($projectId)->name : 'All Projects';
        $dateRange = "Last {$period} days (" . $startDate->format('M d, Y') . " - " . now()->format('M d, Y') . ")";

        $data = [
            'metrics' => $metrics,
            'teamPerformance' => $teamPerformance,
            'taskDistribution' => $taskDistribution,
            'projectName' => $projectName,
            'dateRange' => $dateRange,
        ];

        $pdf = Pdf::loadView('reports.analytics', $data);
        $fileName = 'Analytics-Report-' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($fileName);
    }
}