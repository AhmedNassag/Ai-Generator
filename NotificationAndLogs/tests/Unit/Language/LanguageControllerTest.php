<?php

namespace Tests\Unit\Language;

use App\Models\Language\Language;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LanguageControllerTest extends TestCase
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
    public function it_can_list_Languages()
    {
        // Arrange: Insert mock Languages into the database
        Language::insert([
            ['name' => 'Language 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Languages
        $response = $this->getJson(route('language.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Language()
    {
        // Arrange: Prepare Language data
        $data = [
            'name' => 'Language',

        ];

        // Act: Send a POST request to create a new Language
        $response = $this->postJson(route('language.store'), $data);
        // Assert: Verify the Language is created and database contains the new Language
        $response->assertOk();
        $this->assertDatabaseHas((new Language())->getTable(), [
            'name' => 'Language',

        ]);
    }

    /** @test */
    public function it_can_show_a_Language()
    {
        // Arrange: Create a test Language
        $Language = Language::create([
            'name' => 'Language Test',

        ]);

        // Act: Send a GET request to retrieve the Language's details
        $response = $this->getJson(route('language.show', (string) $Language->id));

        // Assert: Verify the response contains the correct Language details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Language->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Language()
    {
        // Arrange: Create a test Language
        $Language = Language::create([
            'name' => 'Language Test',

        ]);
        $data = [
            'name' => 'Language',

        ];

        // Act: Send a PUT request to update the Language's details
        $response = $this->putJson(route('language.update', (string) $Language->id), $data);

        // Assert: Verify the Language's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Language())->getTable(), [
            '_id' => $Language->id,
            'name' => 'Language',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Language()
    {
        // Arrange: Create a test Language
        $Language = Language::create([
            'name' => 'Language Test',
            'email' => 'Language@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Language
        $response = $this->deleteJson(route('language.destroy', (string) $Language->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Language is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Language())->getTable(), [
            '_id' => $Language->id,
        ]);

        // Act: Send another DELETE request to force delete the Language
        $responseForceDelete = $this->deleteJson(route('language.destroy', (string) $Language->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Language is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Language())->getTable(), [
            '_id' => $Language->id,
        ]);
    }
}
