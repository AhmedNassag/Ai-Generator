<?php

namespace Tests\Unit\Maturity;

use App\Models\Maturity\Maturity;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MaturityControllerTest extends TestCase
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
    public function it_can_list_Maturitys()
    {
        // Arrange: Insert mock Maturitys into the database
        Maturity::insert([
            ['name' => 'Maturity 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Maturitys
        $response = $this->getJson(route('maturity.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Maturity()
    {
        // Arrange: Prepare Maturity data
        $data = [
            'name' => 'Maturity',

        ];

        // Act: Send a POST request to create a new Maturity
        $response = $this->postJson(route('maturity.store'), $data);
        // Assert: Verify the Maturity is created and database contains the new Maturity
        $response->assertOk();
        $this->assertDatabaseHas((new Maturity())->getTable(), [
            'name' => 'Maturity',

        ]);
    }

    /** @test */
    public function it_can_show_a_Maturity()
    {
        // Arrange: Create a test Maturity
        $Maturity = Maturity::create([
            'name' => 'Maturity Test',

        ]);

        // Act: Send a GET request to retrieve the Maturity's details
        $response = $this->getJson(route('maturity.show', (string) $Maturity->id));

        // Assert: Verify the response contains the correct Maturity details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Maturity->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Maturity()
    {
        // Arrange: Create a test Maturity
        $Maturity = Maturity::create([
            'name' => 'Maturity Test',

        ]);
        $data = [
            'name' => 'Maturity',

        ];

        // Act: Send a PUT request to update the Maturity's details
        $response = $this->putJson(route('maturity.update', (string) $Maturity->id), $data);

        // Assert: Verify the Maturity's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Maturity())->getTable(), [
            '_id' => $Maturity->id,
            'name' => 'Maturity',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Maturity()
    {
        // Arrange: Create a test Maturity
        $Maturity = Maturity::create([
            'name' => 'Maturity Test',
            'email' => 'Maturity@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Maturity
        $response = $this->deleteJson(route('maturity.destroy', (string) $Maturity->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Maturity is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Maturity())->getTable(), [
            '_id' => $Maturity->id,
        ]);

        // Act: Send another DELETE request to force delete the Maturity
        $responseForceDelete = $this->deleteJson(route('maturity.destroy', (string) $Maturity->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Maturity is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Maturity())->getTable(), [
            '_id' => $Maturity->id,
        ]);
    }
}
