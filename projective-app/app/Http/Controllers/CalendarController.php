<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    /**
     * Display the calendar with all tasks that have a due date.
     */
    public function index()
    {
        // Fetch all tasks that have a due date.
        $tasks = Task::whereNotNull('due_date')->get();

        // Render the Calendar page and pass the tasks as a prop.
        return Inertia::render('Calendar', [
            'tasks' => $tasks,
        ]);
    }
}