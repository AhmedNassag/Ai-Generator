<?php

namespace Tests\Feature\Hierarchy;

use App\Models\Hierarchy\Hierarchy;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HierarchyControllerTest extends TestCase
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
    public function it_can_list_Hierarchys()
    {
        // Arrange: Insert mock Hierarchys into the database
        Hierarchy::insert([
            ['name' => 'Hierarchy 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Hierarchys
        $response = $this->getJson(route('hierarchy.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Hierarchy()
    {
        // Arrange: Prepare Hierarchy data
        $data = [
            'name' => 'Hierarchy',

        ];

        // Act: Send a POST request to create a new Hierarchy
        $response = $this->postJson(route('hierarchy.store'), $data);
        // Assert: Verify the Hierarchy is created and database contains the new Hierarchy
        $response->assertOk();
        $this->assertDatabaseHas((new Hierarchy())->getTable(), [
            'name' => 'Hierarchy',

        ]);
    }

    /** @test */
    public function it_can_show_a_Hierarchy()
    {
        // Arrange: Create a test Hierarchy
        $Hierarchy = Hierarchy::create([
            'name' => 'Hierarchy Test',

        ]);

        // Act: Send a GET request to retrieve the Hierarchy's details
        $response = $this->getJson(route('hierarchy.show', (string) $Hierarchy->id));

        // Assert: Verify the response contains the correct Hierarchy details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Hierarchy->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Hierarchy()
    {
        // Arrange: Create a test Hierarchy
        $Hierarchy = Hierarchy::create([
            'name' => 'Hierarchy Test',

        ]);
        $data = [
            'name' => 'Hierarchy',

        ];

        // Act: Send a PUT request to update the Hierarchy's details
        $response = $this->putJson(route('hierarchy.update', (string) $Hierarchy->id), $data);

        // Assert: Verify the Hierarchy's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Hierarchy())->getTable(), [
            '_id' => $Hierarchy->id,
            'name' => 'Hierarchy',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Hierarchy()
    {
        // Arrange: Create a test Hierarchy
        $Hierarchy = Hierarchy::create([
            'name' => 'Hierarchy Test',
            'email' => 'Hierarchy@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Hierarchy
        $response = $this->deleteJson(route('hierarchy.destroy', (string) $Hierarchy->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Hierarchy is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Hierarchy())->getTable(), [
            '_id' => $Hierarchy->id,
        ]);

        // Act: Send another DELETE request to force delete the Hierarchy
        $responseForceDelete = $this->deleteJson(route('hierarchy.destroy', (string) $Hierarchy->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Hierarchy is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Hierarchy())->getTable(), [
            '_id' => $Hierarchy->id,
        ]);
    }
}
