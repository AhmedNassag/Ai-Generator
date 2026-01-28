<?php

namespace Tests\Unit\LogSetting;

use App\Models\LogSetting\LogSetting;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LogSettingControllerTest extends TestCase
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
    public function it_can_list_LogSettings()
    {
        // Arrange: Insert mock LogSettings into the database
        LogSetting::insert([
            ['name' => 'LogSetting 1'],

        ]);

        // Act: Send a GET request to retrieve the list of LogSettings
        $response = $this->getJson(route('log-setting.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_LogSetting()
    {
        // Arrange: Prepare LogSetting data
        $data = [
            'name' => 'LogSetting',

        ];

        // Act: Send a POST request to create a new LogSetting
        $response = $this->postJson(route('log-setting.store'), $data);
        // Assert: Verify the LogSetting is created and database contains the new LogSetting
        $response->assertOk();
        $this->assertDatabaseHas((new LogSetting())->getTable(), [
            'name' => 'LogSetting',

        ]);
    }

    /** @test */
    public function it_can_show_a_LogSetting()
    {
        // Arrange: Create a test LogSetting
        $LogSetting = LogSetting::create([
            'name' => 'LogSetting Test',

        ]);

        // Act: Send a GET request to retrieve the LogSetting's details
        $response = $this->getJson(route('log-setting.show', (string) $LogSetting->id));

        // Assert: Verify the response contains the correct LogSetting details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $LogSetting->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_LogSetting()
    {
        // Arrange: Create a test LogSetting
        $LogSetting = LogSetting::create([
            'name' => 'LogSetting Test',

        ]);
        $data = [
            'name' => 'LogSetting',

        ];

        // Act: Send a PUT request to update the LogSetting's details
        $response = $this->putJson(route('log-setting.update', (string) $LogSetting->id), $data);

        // Assert: Verify the LogSetting's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new LogSetting())->getTable(), [
            '_id' => $LogSetting->id,
            'name' => 'LogSetting',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_LogSetting()
    {
        // Arrange: Create a test LogSetting
        $LogSetting = LogSetting::create([
            'name' => 'LogSetting Test',
            'email' => 'LogSetting@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the LogSetting
        $response = $this->deleteJson(route('log-setting.destroy', (string) $LogSetting->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the LogSetting is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new LogSetting())->getTable(), [
            '_id' => $LogSetting->id,
        ]);

        // Act: Send another DELETE request to force delete the LogSetting
        $responseForceDelete = $this->deleteJson(route('log-setting.destroy', (string) $LogSetting->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the LogSetting is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new LogSetting())->getTable(), [
            '_id' => $LogSetting->id,
        ]);
    }
}
