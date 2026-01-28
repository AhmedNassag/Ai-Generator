<?php

namespace Tests\Unit\Log;

use App\Models\Log\Log;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LogControllerTest extends TestCase
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
    public function it_can_list_Logs()
    {
        // Arrange: Insert mock Logs into the database
        Log::insert([
            ['name' => 'Log 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Logs
        $response = $this->getJson(route('log.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Log()
    {
        // Arrange: Prepare Log data
        $data = [
            'name' => 'Log',

        ];

        // Act: Send a POST request to create a new Log
        $response = $this->postJson(route('log.store'), $data);
        // Assert: Verify the Log is created and database contains the new Log
        $response->assertOk();
        $this->assertDatabaseHas((new Log())->getTable(), [
            'name' => 'Log',

        ]);
    }

    /** @test */
    public function it_can_show_a_Log()
    {
        // Arrange: Create a test Log
        $Log = Log::create([
            'name' => 'Log Test',

        ]);

        // Act: Send a GET request to retrieve the Log's details
        $response = $this->getJson(route('log.show', (string) $Log->id));

        // Assert: Verify the response contains the correct Log details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Log->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Log()
    {
        // Arrange: Create a test Log
        $Log = Log::create([
            'name' => 'Log Test',

        ]);
        $data = [
            'name' => 'Log',

        ];

        // Act: Send a PUT request to update the Log's details
        $response = $this->putJson(route('log.update', (string) $Log->id), $data);

        // Assert: Verify the Log's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Log())->getTable(), [
            '_id' => $Log->id,
            'name' => 'Log',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Log()
    {
        // Arrange: Create a test Log
        $Log = Log::create([
            'name' => 'Log Test',
            'email' => 'Log@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Log
        $response = $this->deleteJson(route('log.destroy', (string) $Log->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Log is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Log())->getTable(), [
            '_id' => $Log->id,
        ]);

        // Act: Send another DELETE request to force delete the Log
        $responseForceDelete = $this->deleteJson(route('log.destroy', (string) $Log->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Log is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Log())->getTable(), [
            '_id' => $Log->id,
        ]);
    }
}
