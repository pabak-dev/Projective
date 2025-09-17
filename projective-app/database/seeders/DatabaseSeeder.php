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


        
    }
}
