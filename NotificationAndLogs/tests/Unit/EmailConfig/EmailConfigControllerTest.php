<?php

namespace Tests\Unit\EmailConfig;

use App\Models\EmailConfig\EmailConfig;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EmailConfigControllerTest extends TestCase
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
    public function it_can_list_EmailConfigs()
    {
        // Arrange: Insert mock EmailConfigs into the database
        EmailConfig::insert([
            ['name' => 'EmailConfig 1'],

        ]);

        // Act: Send a GET request to retrieve the list of EmailConfigs
        $response = $this->getJson(route('email-config.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_EmailConfig()
    {
        // Arrange: Prepare EmailConfig data
        $data = [
            'name' => 'EmailConfig',

        ];

        // Act: Send a POST request to create a new EmailConfig
        $response = $this->postJson(route('email-config.store'), $data);
        // Assert: Verify the EmailConfig is created and database contains the new EmailConfig
        $response->assertOk();
        $this->assertDatabaseHas((new EmailConfig())->getTable(), [
            'name' => 'EmailConfig',

        ]);
    }

    /** @test */
    public function it_can_show_a_EmailConfig()
    {
        // Arrange: Create a test EmailConfig
        $EmailConfig = EmailConfig::create([
            'name' => 'EmailConfig Test',

        ]);

        // Act: Send a GET request to retrieve the EmailConfig's details
        $response = $this->getJson(route('email-config.show', (string) $EmailConfig->id));

        // Assert: Verify the response contains the correct EmailConfig details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $EmailConfig->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_EmailConfig()
    {
        // Arrange: Create a test EmailConfig
        $EmailConfig = EmailConfig::create([
            'name' => 'EmailConfig Test',

        ]);
        $data = [
            'name' => 'EmailConfig',

        ];

        // Act: Send a PUT request to update the EmailConfig's details
        $response = $this->putJson(route('email-config.update', (string) $EmailConfig->id), $data);

        // Assert: Verify the EmailConfig's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new EmailConfig())->getTable(), [
            '_id' => $EmailConfig->id,
            'name' => 'EmailConfig',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_EmailConfig()
    {
        // Arrange: Create a test EmailConfig
        $EmailConfig = EmailConfig::create([
            'name' => 'EmailConfig Test',
            'email' => 'EmailConfig@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the EmailConfig
        $response = $this->deleteJson(route('email-config.destroy', (string) $EmailConfig->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the EmailConfig is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new EmailConfig())->getTable(), [
            '_id' => $EmailConfig->id,
        ]);

        // Act: Send another DELETE request to force delete the EmailConfig
        $responseForceDelete = $this->deleteJson(route('email-config.destroy', (string) $EmailConfig->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the EmailConfig is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new EmailConfig())->getTable(), [
            '_id' => $EmailConfig->id,
        ]);
    }
}
