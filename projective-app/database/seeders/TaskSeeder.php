<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Task;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Comment out or delete the following lines to prevent
        // automatic task creation during seeding.

        /*
        Task::create([
            'title' => 'Design new landing page',
            'description' => 'Create a modern and responsive design for the new landing page.',
            'status' => 'done',
            'priority' => 'high',
            'type' => 'task',
            'due_date' => '2025-09-08',
            'project_id' => 1,
            'assignee_id' => 1,
        ]);

        Task::create([
            'title' => 'API Integration',
            'description' => 'Integrate the new third-party API for payment processing.',
            'status' => 'in_progress',
            'priority' => 'high',
            'type' => 'task',
            'due_date' => '2025-09-15',
            'project_id' => 1,
            'assignee_id' => 2,
        ]);
        */
    }
}