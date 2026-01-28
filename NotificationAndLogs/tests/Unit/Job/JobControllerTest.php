<?php

namespace Tests\Unit\Job;

use App\Models\Job\Job;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class JobControllerTest extends TestCase
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
    public function it_can_list_Jobs()
    {
        // Arrange: Insert mock Jobs into the database
        Job::insert([
            ['name' => 'Job 1'],

        ]);

        // Act: Send a GET request to retrieve the list of Jobs
        $response = $this->getJson(route('job.index'));

        // Assert: Verify the response is successful and contains the correct data
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_Job()
    {
        // Arrange: Prepare Job data
        $data = [
            'name' => 'Job',

        ];

        // Act: Send a POST request to create a new Job
        $response = $this->postJson(route('job.store'), $data);
        // Assert: Verify the Job is created and database contains the new Job
        $response->assertOk();
        $this->assertDatabaseHas((new Job())->getTable(), [
            'name' => 'Job',

        ]);
    }

    /** @test */
    public function it_can_show_a_Job()
    {
        // Arrange: Create a test Job
        $Job = Job::create([
            'name' => 'Job Test',

        ]);

        // Act: Send a GET request to retrieve the Job's details
        $response = $this->getJson(route('job.show', (string) $Job->id));

        // Assert: Verify the response contains the correct Job details
        $response->assertOk();
        $response->assertJsonFragment([
            'name' => $Job->name,

        ]);
    }

    /** @test */
    public function it_can_update_a_Job()
    {
        // Arrange: Create a test Job
        $Job = Job::create([
            'name' => 'Job Test',

        ]);
        $data = [
            'name' => 'Job',

        ];

        // Act: Send a PUT request to update the Job's details
        $response = $this->putJson(route('job.update', (string) $Job->id), $data);

        // Assert: Verify the Job's details are updated in the database
        $response->assertOk();
        $this->assertDatabaseHas((new Job())->getTable(), [
            '_id' => $Job->id,
            'name' => 'Job',
        ]);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_Job()
    {
        // Arrange: Create a test Job
        $Job = Job::create([
            'name' => 'Job Test',
            'email' => 'Job@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act: Send a DELETE request to soft delete the Job
        $response = $this->deleteJson(route('job.destroy', (string) $Job->id), [
            'forceDelete' => false,
        ]);

        // Assert: Verify the Job is soft deleted
        $response->assertOk();
        $this->assertSoftDeleted((new Job())->getTable(), [
            '_id' => $Job->id,
        ]);

        // Act: Send another DELETE request to force delete the Job
        $responseForceDelete = $this->deleteJson(route('job.destroy', (string) $Job->id), [
            'forceDelete' => true,
        ]);

        // Assert: Verify the Job is permanently removed from the database
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing((new Job())->getTable(), [
            '_id' => $Job->id,
        ]);
    }
}
