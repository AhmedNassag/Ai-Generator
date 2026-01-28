<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team\Team;
use App\Models\User\User;
use App\Models\Vulnerability\Vulnerability;
use App\Models\Asset\Asset;
use App\Models\Risk\Risk;
use Faker\Factory as Faker;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();
        // Create 100 teams
        for ($i = 0; $i < 100; $i++) {
            Team::create([
                'name' => $faker->company,
            ]);
        }
    }
}