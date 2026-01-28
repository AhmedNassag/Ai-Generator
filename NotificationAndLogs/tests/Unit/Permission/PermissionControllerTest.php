<?php

namespace Tests\Unit\Permission;

use App\Models\Permission\Permission;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PermissionControllerTest extends TestCase
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
    public function it_can_list_Permissions()
    {
        // Arrange: Insert mock Permissions into the database
        Permission::insert([
            ['name' => 'Permission 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Permissions
        $response = $this->getJson(route('permission.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Permission()
    {
        // Arrange: Prepare Permission data
        $data = [
            'name' => 'Permission',

        ];

        // Act: Send a POST request to create a new Permission
        $response = $this->postJson(route('permission.store'), $data);
        // Assert: Verify the Permission is created and database contains the new Permission
        $response->assertOk();
        $this->assertDatabaseHas((new Permission())->getTable(), [
            'name' => 'Permission',

        ]);
    }

    /** @test */
    public function it_can_show_a_Permission()
    {
        // Arrange: Create a test Permission
        $Permission = Permission::create([
            'name' => 'Permission Test',

        ]);

        // Act: Send a GET request to retrieve the Permission's details
        $response = $this->getJson(route('permission.show', (string) $Permission->id));

        // Assert: Verify the response contains the correct Permission details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Permission->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Permission()
    {
        // Arrange: Create a test Permission
        $Permission = Permission::create([
            'name' => 'Permission Test',

        ]);
        $data = [
            'name' => 'Permission',

        ];

        // Act: Send a PUT request to update the Permission's details
        $response = $this->putJson(route('permission.update', (string) $Permission->id), $data);

        // Assert: Verify the Permission's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Permission())->getTable(), [
            '_id' => $Permission->id,
            'name' => 'Permission',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Permission()
    {
        // Arrange: Create a test Permission
        $Permission = Permission::create([
            'name' => 'Permission Test',
            'email' => 'Permission@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Permission
        $response = $this->deleteJson(route('permission.destroy', (string) $Permission->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Permission is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Permission())->getTable(), [
            '_id' => $Permission->id,
        ]);

        // Act: Send another DELETE request to force delete the Permission
        $responseForceDelete = $this->deleteJson(route('permission.destroy', (string) $Permission->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Permission is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Permission())->getTable(), [
            '_id' => $Permission->id,
        ]);
    }
}
