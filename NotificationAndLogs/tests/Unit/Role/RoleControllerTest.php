<?php

namespace Tests\Unit\Role;

use App\Models\Color\Color;
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
     */
    protected function clearDatabase(): void
    {
        DB::connection('mongodb')->getMongoClient()
            ->selectDatabase(config('database.connections.mongodb.database'))
            ->drop();
    }

    /** @test */
    public function it_can_list_Roles()
    {
        // Arrange: Insert mock Roles into the database
        Role::insert([
            ['name' => 'Role 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Roles
        $response = $this->getJson(route('role.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Role()
    {
        $permission = Permission::create([
            'name' => 'Permission',
            'description' => 'Permission Description',
        ]);
        $job = Job::create([
            'name' => 'Job',
            'description' => 'Job Description',
        ]);
       
        // Arrange: Prepare Role data
        $data = [
            'name' => 'Role',
            'job_id' => $job->id,
            'permission_ids' => [$permission->id],

        ];

        // Act: Send a POST request to create a new Role
        $response = $this->postJson(route('role.store'), $data);
        // Assert: Verify the Role is created and database contains the new Role
        $response->assertOk();
        $this->assertDatabaseHas((new Role())->getTable(), [
            'name' => 'Role',

        ]);
    }

    /** @test */
    public function it_can_show_a_Role()
    {
        // Arrange: Create a test Role
        $Role = Role::create([
            'name' => 'Role Test',

        ]);

        // Act: Send a GET request to retrieve the Role's details
        $response = $this->getJson(route('role.show', (string) $Role->id));

        // Assert: Verify the response contains the correct Role details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Role->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Role()
    {
        $permission = Permission::create([
            'name' => 'Permission',
            'description' => 'Permission Description',
        ]);
        $job = Job::create([
            'name' => 'Job',
            'description' => 'Job Description',
        ]);
       
        // Arrange: Create a test Role
        $Role = Role::create([
            'name' => 'Role Test',
           
        ]);
        $data = [
            'name' => 'Role',
            'job_id' => $job->id,
            'permission_ids' => [$permission->id],
        ];

        // Act: Send a PUT request to update the Role's details
        $response = $this->putJson(route('role.update', (string) $Role->id), $data);

        // Assert: Verify the Role's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Role())->getTable(), [
            '_id' => $Role->id,
            'name' => 'Role',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Role()
    {
        // Arrange: Create a test Role
        $Role = Role::create([
            'name' => 'Role Test',
            'email' => 'Role@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Role
        $response = $this->deleteJson(route('role.destroy', (string) $Role->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Role is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Role())->getTable(), [
            '_id' => $Role->id,
        ]);

        // Act: Send another DELETE request to force delete the Role
        $responseForceDelete = $this->deleteJson(route('role.destroy', (string) $Role->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Role is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Role())->getTable(), [
            '_id' => $Role->id,
        ]);
    }
}
