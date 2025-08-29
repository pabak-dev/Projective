<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run($user, $project): void
    {
        Task::create([
            'project_id'   => $project->id,
            'title'        => 'Design new landing page',
            'description'  => 'Create wireframes and mockups for the new product landing page',
            'status'       => 'todo',
            'due_date'     => now()->addDays(7),
            'assignee_id'  => $user->id,
            'comments_count' => 3,
            'attachments_count' => 2,
        ]);

        Task::create([
            'project_id'   => $project->id,
            'title'        => 'API Documentation',
            'description'  => 'Update API documentation for v2.0 release',
            'status'       => 'todo',
            'due_date'     => now()->addDays(10),
            'assignee_id'  => $user->id,
            'comments_count' => 2,
            'attachments_count' => 1,
        ]);
    }
}
