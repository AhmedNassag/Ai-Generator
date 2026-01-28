<?php

namespace Tests\Feature\Position;

use App\Models\Position\Position;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PositionControllerTest extends TestCase
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
    public function it_can_list_Positions()
    {
        // Arrange: Insert mock Positions into the database
        Position::insert([
            [
                'name' => 'Position 1',
                'description' => 'description',
                'code' => 'code'
            ],

        ]);

        // Act: Send a GET request to retrieve the list of Positions
        $response = $this->getJson(route('position.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Position()
    {
        // Arrange: Prepare Position data
        $data = [
            'name' => 'Position 1',
            'description' => 'description',
            'code' => 'code'

        ];

        // Act: Send a POST request to create a new Position
        $response = $this->postJson(route('position.store'), $data);
        // Assert: Verify the Position is created and database contains the new Position
        $response->assertOk();
        $this->assertDatabaseHas((new Position())->getTable(), [
            'name' => 'Position 1',
            'description' => 'description',
            'code' => 'code'

        ]);
    }

    /** @test */
    public function it_can_show_a_Position()
    {
        // Arrange: Create a test Position
        $Position = Position::create([
            'name' => 'Position 1',
            'description' => 'description',
            'code' => 'code'

        ]);

        // Act: Send a GET request to retrieve the Position's details
        $response = $this->getJson(route('position.show', (string) $Position->id));

        // Assert: Verify the response contains the correct Position details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Position->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Position()
    {
        // Arrange: Create a test Position
        $Position = Position::create([
            'name' => 'Position 1',
            'description' => 'description',
            'code' => 'code'

        ]);
        $data = [
            'name' => 'Position 1',
            'description' => 'description',
            'code' => 'code'

        ];

        // Act: Send a PUT request to update the Position's details
        $response = $this->putJson(route('position.update', (string) $Position->id), $data);

        // Assert: Verify the Position's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Position())->getTable(), [
            '_id' => $Position->id,
            'name' => $Position->name,
            'description' => $Position->description,
            'code' => $Position->code
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Position()
    {
        // Arrange: Create a test Position
        $Position = Position::create([
            'name' => 'Position 1',
            'description' => 'description',
            'code' => 'code'
        ]);

        // Act: Send a DELETE request to soft delete the Position
        $response = $this->deleteJson(route('position.destroy', (string) $Position->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Position is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Position())->getTable(), [
            '_id' => $Position->id,
        ]);

        // Act: Send another DELETE request to force delete the Position
        $responseForceDelete = $this->deleteJson(route('position.destroy', (string) $Position->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Position is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Position())->getTable(), [
            '_id' => $Position->id,
        ]);
    }
}
