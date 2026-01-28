<?php

namespace Tests\Feature\Team;

use App\Models\Team\Team;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TeamControllerTest extends TestCase
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
    public function it_can_list_Teams()
    {
        // Arrange: Insert mock Teams into the database
        Team::insert([
            ['name' => 'Team 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Teams
        $response = $this->getJson(route('team.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Team()
    {
        // Arrange: Prepare Team data
        $data = [
            'name' => 'Team',

        ];

        // Act: Send a POST request to create a new Team
        $response = $this->postJson(route('team.store'), $data);
        // Assert: Verify the Team is created and database contains the new Team
        $response->assertOk();
        $this->assertDatabaseHas((new Team())->getTable(), [
            'name' => 'Team',

        ]);
    }

    /** @test */
    public function it_can_show_a_Team()
    {
        // Arrange: Create a test Team
        $Team = Team::create([
            'name' => 'Team Test',

        ]);

        // Act: Send a GET request to retrieve the Team's details
        $response = $this->getJson(route('team.show', (string) $Team->id));

        // Assert: Verify the response contains the correct Team details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Team->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Team()
    {
        // Arrange: Create a test Team
        $Team = Team::create([
            'name' => 'Team Test',

        ]);
        $data = [
            'name' => 'Team',

        ];

        // Act: Send a PUT request to update the Team's details
        $response = $this->putJson(route('team.update', (string) $Team->id), $data);

        // Assert: Verify the Team's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Team())->getTable(), [
            '_id' => $Team->id,
            'name' => 'Team',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Team()
    {
        // Arrange: Create a test Team
        $Team = Team::create([
            'name' => 'Team Test',
            'email' => 'Team@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Team
        $response = $this->deleteJson(route('team.destroy', (string) $Team->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Team is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Team())->getTable(), [
            '_id' => $Team->id,
        ]);

        // Act: Send another DELETE request to force delete the Team
        $responseForceDelete = $this->deleteJson(route('team.destroy', (string) $Team->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Team is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Team())->getTable(), [
            '_id' => $Team->id,
        ]);
    }
}
