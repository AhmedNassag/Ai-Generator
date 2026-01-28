<?php

namespace Tests\Unit\Notification;

use App\Models\Notification\Notification;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
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
    public function it_can_list_Notifications()
    {
        // Arrange: Insert mock Notifications into the database
        Notification::insert([
            ['name' => 'Notification 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Notifications
        $response = $this->getJson(route('notification.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Notification()
    {
        // Arrange: Prepare Notification data
        $data = [
            'name' => 'Notification',

        ];

        // Act: Send a POST request to create a new Notification
        $response = $this->postJson(route('notification.store'), $data);
        // Assert: Verify the Notification is created and database contains the new Notification
        $response->assertOk();
        $this->assertDatabaseHas((new Notification())->getTable(), [
            'name' => 'Notification',

        ]);
    }

    /** @test */
    public function it_can_show_a_Notification()
    {
        // Arrange: Create a test Notification
        $Notification = Notification::create([
            'name' => 'Notification Test',

        ]);

        // Act: Send a GET request to retrieve the Notification's details
        $response = $this->getJson(route('notification.show', (string) $Notification->id));

        // Assert: Verify the response contains the correct Notification details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Notification->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Notification()
    {
        // Arrange: Create a test Notification
        $Notification = Notification::create([
            'name' => 'Notification Test',

        ]);
        $data = [
            'name' => 'Notification',

        ];

        // Act: Send a PUT request to update the Notification's details
        $response = $this->putJson(route('notification.update', (string) $Notification->id), $data);

        // Assert: Verify the Notification's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Notification())->getTable(), [
            '_id' => $Notification->id,
            'name' => 'Notification',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Notification()
    {
        // Arrange: Create a test Notification
        $Notification = Notification::create([
            'name' => 'Notification Test',
            'email' => 'Notification@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Notification
        $response = $this->deleteJson(route('notification.destroy', (string) $Notification->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Notification is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Notification())->getTable(), [
            '_id' => $Notification->id,
        ]);

        // Act: Send another DELETE request to force delete the Notification
        $responseForceDelete = $this->deleteJson(route('notification.destroy', (string) $Notification->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Notification is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Notification())->getTable(), [
            '_id' => $Notification->id,
        ]);
    }
}
