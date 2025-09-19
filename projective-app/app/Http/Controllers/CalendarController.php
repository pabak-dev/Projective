<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class CalendarController extends Controller
{
    /**
     * Display the calendar with tasks filtered by period/date.
     *
     * Query parameters:
     *  - period: 'monthly' (default), 'weekly', 'daily', 'all_time'
     *  - date: optional ISO date (YYYY-MM-DD) used as the reference date (defaults to today)
     */
    public function index(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $dateParam = $request->get('date');

        // Parse the date (or use today)
        try {
            $date = $dateParam ? Carbon::parse($dateParam) : Carbon::today();
        } catch (\Exception $e) {
            $date = Carbon::today();
        }

        // Base query: tasks that have a due date
        $query = Task::whereNotNull('due_date');

        if ($period === 'monthly') {
            $start = $date->copy()->startOfMonth()->startOfDay();
            $end = $date->copy()->endOfMonth()->endOfDay();
            $query->whereBetween('due_date', [$start->toDateString(), $end->toDateString()]);
        } elseif ($period === 'weekly') {
            // Use Sunday as start of week to match typical calendar UX; change to Carbon::MONDAY if you prefer Monday
            $start = $date->copy()->startOfWeek(Carbon::SUNDAY)->startOfDay();
            $end = $date->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();
            $query->whereBetween('due_date', [$start->toDateString(), $end->toDateString()]);
        } elseif (in_array($period, ['daily', 'day'])) {
            $start = $date->copy()->startOfDay();
            $end = $date->copy()->endOfDay();
            $query->whereBetween('due_date', [$start->toDateString(), $end->toDateString()]);
        } elseif ($period === 'all_time') {
            // leave the base query (all tasks with due_date)
        } else {
            // If unknown period, default to monthly
            $start = $date->copy()->startOfMonth()->startOfDay();
            $end = $date->copy()->endOfMonth()->endOfDay();
            $query->whereBetween('due_date', [$start->toDateString(), $end->toDateString()]);
            $period = 'monthly';
        }

        $tasks = $query->get();

        // Return Inertia view, passing tasks and the active period/date so frontend can keep state in sync
        return Inertia::render('Calendar', [
            'tasks' => $tasks,
            'period' => $period,
            'date' => $date->toDateString(),
        ]);
    }
}
