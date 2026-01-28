<?php

namespace Tests\Feature\Role;

use App\Models\Color\Color;
use App\Models\Department\Department;
use App\Models\Job\Job;
use App\Models\Permission\Permission;
use App\Models\Role\Role;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    /**
     * Set up the test environment.
     * Clears the database to ensure a clean state for each test.
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->clearDatabase();
    }

    /**
     * Clears all collections in the MongoDB database.
     * Simulates a fresh database state before each test.
     * 
     * 
     * php artisan test tests/Unit/Role/RoleControllerTest.php 
     */
    protected function clearDatabase(): void
    {
        DB::connection('mongodb')->getMongoClient()
            ->selectDatabase(config('database.connections.mongodb.database'))
            ->drop();
    }



    /** @test */




    /** @test */
    public function it_can_create_a_role()
    {
        $permission = [
            // {name: 'Government', controller: 'Government', update: true}
            (object)[
                'name' => 'Government',
                'controller' => 'Government',
                'update' => true
            ]
        ];
        $job = Job::create([
            'name' => 'Job',
            'description' => 'Job Description',
        ]);
        $department = Department::create([
            'name' => 'dep',
            'code' =>'code',
            'job_ids' =>[$job->id]
        ]);
        $job->update(['department_ids' => [$department->id]]);


        $data = [
            'type' => 'update',
            'department_id' => $department->id,
            'job_id' => $job->id,
            'permissions' => $permission
        ];

        // Act: Send a PUT request to update the Role's details
        $response = $this->postJson(route('role.store'), $data);

        // Assert: Verify the Role is created and database contains the role
        $response->assertOk();

    }


}
