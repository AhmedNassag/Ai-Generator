<?php

namespace Tests\Unit\NotificationSetting;

use App\Models\NotificationSetting\NotificationSetting;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NotificationSettingControllerTest extends TestCase
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
    public function it_can_list_NotificationSettings()
    {
        // Arrange: Insert mock NotificationSettings into the database
        NotificationSetting::insert([
            ['name' => 'NotificationSetting 1'],

        ]);

        // Act: Send a GET request to retrieve the list of NotificationSettings
        $response = $this->getJson(route('notification-setting.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_NotificationSetting()
    {
        // Arrange: Prepare NotificationSetting data
        $data = [
            'name' => 'NotificationSetting',

        ];

        // Act: Send a POST request to create a new NotificationSetting
        $response = $this->postJson(route('notification-setting.store'), $data);
        // Assert: Verify the NotificationSetting is created and database contains the new NotificationSetting
        $response->assertOk();
        $this->assertDatabaseHas((new NotificationSetting())->getTable(), [
            'name' => 'NotificationSetting',

        ]);
    }

    /** @test */
    public function it_can_show_a_NotificationSetting()
    {
        // Arrange: Create a test NotificationSetting
        $NotificationSetting = NotificationSetting::create([
            'name' => 'NotificationSetting Test',

        ]);

        // Act: Send a GET request to retrieve the NotificationSetting's details
        $response = $this->getJson(route('notification-setting.show', (string) $NotificationSetting->id));

        // Assert: Verify the response contains the correct NotificationSetting details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $NotificationSetting->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_NotificationSetting()
    {
        // Arrange: Create a test NotificationSetting
        $NotificationSetting = NotificationSetting::create([
            'name' => 'NotificationSetting Test',

        ]);
        $data = [
            'name' => 'NotificationSetting',

        ];

        // Act: Send a PUT request to update the NotificationSetting's details
        $response = $this->putJson(route('notification-setting.update', (string) $NotificationSetting->id), $data);

        // Assert: Verify the NotificationSetting's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new NotificationSetting())->getTable(), [
            '_id' => $NotificationSetting->id,
            'name' => 'NotificationSetting',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_NotificationSetting()
    {
        // Arrange: Create a test NotificationSetting
        $NotificationSetting = NotificationSetting::create([
            'name' => 'NotificationSetting Test',
            'email' => 'NotificationSetting@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the NotificationSetting
        $response = $this->deleteJson(route('notification-setting.destroy', (string) $NotificationSetting->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the NotificationSetting is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new NotificationSetting())->getTable(), [
            '_id' => $NotificationSetting->id,
        ]);

        // Act: Send another DELETE request to force delete the NotificationSetting
        $responseForceDelete = $this->deleteJson(route('notification-setting.destroy', (string) $NotificationSetting->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the NotificationSetting is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new NotificationSetting())->getTable(), [
            '_id' => $NotificationSetting->id,
        ]);
    }
}
