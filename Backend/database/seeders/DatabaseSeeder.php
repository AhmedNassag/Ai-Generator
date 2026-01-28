<?php

namespace Database\Seeders;

use Database\Seeders\ColorSeeder;
use Database\Seeders\PositionSeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\TeamSeeder;
use Database\Seeders\JobSeeder;
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
