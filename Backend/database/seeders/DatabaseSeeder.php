<?php

namespace Database\Seeders;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Database\Seeders\DepartmentSeeder;
use Database\Seeders\LmsCourseSeeder;
use Database\Seeders\MaturitySeeder;
use Database\Seeders\RiskSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
	        ColorSeeder::class,
            PositionSeeder::class,
            DepartmentSeeder::class,
            UserSeeder::class,
            TeamSeeder::class,
            JobSeeder::class,
        ]);

    }
}
