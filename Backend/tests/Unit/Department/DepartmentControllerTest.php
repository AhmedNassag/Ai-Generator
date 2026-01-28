<?php

namespace Tests\Feature\Department;

use App\Models\Department\Department;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DepartmentControllerTest extends TestCase
{
    /**
     * Set up the test environment.
     * Clears the database to ensure a clean state for each test.
     *
     * php artisan test tests/Unit/Department/DepartmentControllerTest.php
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->clearDatabase();
        Department::factory(100)->create();
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
    public function it_can_list_Departments()
    {
        // Arrange: Insert mock Departments into the database
        Department::insert([
            ['name' => 'Department 1', 'code' => 'Department Code 1'],
            ['name' => 'Department 2', 'code' => 'Department Code 2'],
            ['name' => 'Department 3', 'code' => 'Department Code 3'],

        ]);

        // Act: Send a GET request to retrieve the list of Departments
        $response = $this->getJson(route('department.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Department()
    {
        // Arrange: Prepare Department data
        $data = [
            'name' => 'Department',
            'code' => 'Department Code',
            'type' => 'GRC',

        ];

        // Act: Send a POST request to create a new Department
        $response = $this->postJson(route('department.store'), $data);
        // Assert: Verify the Department is created and database contains the new Department
        $response->assertOk();
        $this->assertDatabaseHas((new Department())->getTable(), [
            'name' => 'Department',
            'code' => 'Department Code',
            'type' => 'GRC',
        ]);
    }

    /** @test */
    public function it_can_show_a_Department()
    {
        // Arrange: Create a test Department
        $Department = Department::create([
            'name' => 'Department Test',
            'code' => 'Department Code',
            'type' => 'GRC',

        ]);

        // Act: Send a GET request to retrieve the Department's details
        $response = $this->getJson(route('department.show', (string) $Department->id));

        // Assert: Verify the response contains the correct Department details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Department->name,
            'code' => $Department->code,
            'type' => $Department->type,
        ]);
    }

    /** @test */
    public function it_can_update_a_Department()
    {
        // Arrange: Create a test Department
        $Department = Department::create([
            'name' => 'Department Test',
            'code' => 'Department Code',
            'type' => 'GRC',

        ]);
        $data = [
            'name' => 'Department',
            'code' => 'Department Code',
            'type' => 'GRC',

        ];

        // Act: Send a PUT request to update the Department's details
        $response = $this->putJson(route('department.update', (string) $Department->id), $data);

        // Assert: Verify the Department's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Department())->getTable(), [
            '_id' => $Department->id,
            'name' => 'Department',
            'code' => 'Department Code',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Department()
    {
        // Arrange: Create a test Department
        $Department = Department::create([
            'name' => 'Department Test',
            'code' => 'Department Code'
        ]);

        // Act: Send a DELETE request to soft delete the Department
        $response = $this->deleteJson(route('department.destroy', (string) $Department->id), [
            'forceDelete' => false,
        ]);
        // Assert: Verify the Department is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Department())->getTable(), [
            '_id' => $Department->id,
        ]);

        // Act: Send another DELETE request to force delete the Department
        $responseForceDelete = $this->deleteJson(route('department.destroy', (string) $Department->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Department is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Department())->getTable(), [
            '_id' => $Department->id,
        ]);
    }
}
