<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job\Job;
use App\Models\Department\Department;
use App\Models\Position\Position;
use Faker\Factory as Faker;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();

        // Create 100 jobs
        for ($i = 0; $i < 100; $i++) {
            Job::create([
                'name' => $faker->jobTitle,
                'code' => $faker->unique()->bothify('JOB###'),
                'description' => $faker->paragraph,
            ]);
        }
    }
}