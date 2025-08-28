<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user=User::factory()->create([
            'name'=>'Test User',
            'email'=>'test@example.com',
            'password'=>bcrypt('password'),
        ]);

        $project=Project::create([
            'name'=>'Project Alpha',
            'description'=>'Demo project for task board',
        ]);

        Task::create([
            'project_id'=>$project->id,
            'title'=>'Design new landing page',
            'description'=>'Wireframes and mockups',
            'status'=>'todo',
            'due_date'=>now()->addDays(3),
            'assignee_id'=>$user->id,
        ]);
    }
}
