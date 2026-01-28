<?php

namespace Database\Seeders;

use App\Models\Department\Department;
use App\Models\Job\Job;
use App\Models\Team\Team;
use App\Models\User\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $team1 = Team::create(['name' => 'Team One']);
        $team2 = Team::create(['name' => 'Team Two']);
        $team3 = Team::create(['name' => 'Team Three']);

        $teams = [$team1->_id, $team2->_id, $team3->_id];
        for ($i = 1; $i <= 10; $i++) {
            $user = User::firstOrCreate(
            ['email' => "user$i@mail.com"],
                [
                    'full_name'     => "User $i",
                    'username'      => "user$i",
                    'phone'         => '0112935088' . $i,
                    'password'      => Hash::make('12345678'),
                    'department_id' => Department::factory()->create()->id,
                    'job_id' => Job::factory()->create()->id,
                    'type'          => 'GRC',
                    // 'type'          => $i % 2 == 0 ? 'GRC' : 'LDAP',
                    'is_locked'     => false,
                    'status'        => true,
                    'failed_attempts' => rand(0, 3),
                    'lock_until'    => null,
                    'email_verified_at' => now(),
                    'super'         => $i <= 3 ? true : false,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]
            );

            $user->teams()->sync($teams);
        }
    }
}
