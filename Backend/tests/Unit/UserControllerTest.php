<?php

namespace Tests\Feature\User;

use App\Models\Department\Department;
use App\Models\Job\Job;
use App\Models\User\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    private string $apiKey = "d6d3f2b12c3a1f67e345b83d9c8a5f64e947b8d6e3f2b1c7a9e5f4d8a3b1c9f0";

    /** @test */
    public function it_can_list_users()
    {
        User::factory()->count(3)->create();
        $authUser = User::factory()->create();
        $this->actingAs($authUser, 'api');
        $response = $this->getJson(route('user.index'), [
            'x-api-key' => $this->apiKey,
        ]);

        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_user()
    {
        // Arrange: Create an authenticated user
        $authUser = User::factory()->create();
        $this->actingAs($authUser, 'api');

        // Arrange: Prepare user data
        $data = [
            'full_name' => 'Khalid Abed',
            'username' => 'khalid',
            'email' => 'khalid@example.com',
            'phone' =>'01129350885',
            'password' => 'password',
            'super' => true,
            'status' => true,
            'is_locked' => false,
            'type' => 'GRC',
            'department_id' => Department::factory()->create()->id,
            'job_id' => Job::factory()->create()->id,
        ];

        // Act: Send a POST request to create a new user
        $response = $this->postJson(route('user.store'), $data, [
            'x-api-key' => $this->apiKey,
        ]);

        // Assert: Verify user is created and database contains the new user
        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'username' => 'khalid',
            'email' => 'khalid@example.com',
        ]);
    }

    /** @test */
    public function it_can_show_a_user()
    {
        $authUser = User::factory()->create();
        $this->actingAs($authUser, 'api');

        $user = User::factory()->create();

        $response = $this->getJson(route('user.show', $user->id), [
            'x-api-key' => $this->apiKey,
        ]);

        $response->assertOk()->assertJsonFragment([
            'full_name' => $user->full_name,
            'email' => $user->email,
        ]);
    }

    /** @test */
    public function it_can_update_a_user()
    {
        // Arrange
        $authUser = User::factory()->create();
        $this->actingAs($authUser, 'api');

        $user = User::factory()->create();

        $data = [
            'full_name' => 'Endless Addorredr',
            'email' => 'endless@example.com',
            'username' => 'Endless',
            'phone' => '01918174',
            'password' => 'password',
            'super' => true,
            'status' => true,
            'is_locked' => false,
            'type' => 'GRC',
            'department_id' => Department::factory()->create()->id,
            'job_id' => Job::factory()->create()->id,
        ];

        // Act
        $response = $this->putJson(route('user.update', $user->id), $data, [
            'x-api-key' => $this->apiKey,
        ]);

        // Assert
        $response->assertOk();
        unset($data['password']);
        $this->assertDatabaseHas('users', $data);
    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_user()
    {
        $user = User::factory()->create();
        $authUser = User::factory()->create();
        $this->actingAs($authUser, 'api');

        // Soft delete
        $response = $this->deleteJson(route('user.destroy', $user->id), [], [
            'x-api-key' => $this->apiKey,
        ]);

        $response->assertOk();
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        // Force delete
        $responseForceDelete = $this->deleteJson(route('user.destroy', $user->id), [
            'forceDelete' => true,
        ], [
            'x-api-key' => $this->apiKey,
        ]);

        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /** @test */
    public function it_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'editor@example.com',
            'password' => Hash::make('password'),
            'super' => true,
            'status' => true,
            'is_locked' => false,
            'type' => 'GRC',
        ]);

        $response = $this->postJson(route('login'), [
            'login' => 'editor@example.com',
            'password' => 'password',
        ], [
            'x-api-key' => $this->apiKey,
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'status',
            'data' => [
                'expires_in',
                'token',
            ],
        ]);
    }
}

