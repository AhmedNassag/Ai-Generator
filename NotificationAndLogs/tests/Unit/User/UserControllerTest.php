<?php

namespace Tests\Unit\User;

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
        // Arrange
        User::factory()->count(3)->create();
        $authUser = User::factory()->create(); // Create an authenticated user
        $this->actingAs($authUser, 'api'); // Authenticate as the user
        // Act
        $response = $this->getJson(route('user.index'), [
            'x-api-key' => $this->apiKey, // Include the API key
        ]);
        // Assert
        $response->assertOk();
    }

    /** @test */
    public function it_can_create_a_user()
    {
        // Arrange: Prepare user data
        $authUser = User::factory()->create(); // Create an authenticated user
        $this->actingAs($authUser, 'api'); // Authenticate as the user
        $data = [
            'full_name' => 'Khalid Abed',
            'username' => 'khalid',
            'email' => 'khalid@example.com',
            'phone' =>'01129350885',
            'password' => bcrypt('password'),
            'status' =>true,
            'is_locked' =>false,
            'type' => 'GRC',
        ];

        // Act: Send a POST request to create a new user
        $response = $this->postJson(route('user.store'), $data, [
            'x-api-key' => $this->apiKey, // Include the API key
        ]);
        // Assert: Verify the user is created and database contains the new user
        $response->assertOk();
        $this->assertDatabaseHas((new User())->getTable(), [
            'username' => 'John',
            'email' => 'john2@example.com',
        ]);
    }

    /** @test */
    public function it_can_show_a_user()
    {
        // Arrange
        $authUser = User::factory()->create();
        $this->actingAs($authUser, 'api');

        $user = User::factory()->create();
        // Act
        $response = $this->getJson(route('user.show', $user->id), [
            'x-api-key' => $this->apiKey, // Include the API key
        ]);
        // Assert
        $response->assertOk()
        ->assertJsonFragment([
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
            'email' => 'Endless@example.com',
            'username' => 'Endless',
            'phone' => '01918174',
            'password' => 'password',  // Store the plain password here
            'status' =>true,
            'is_locked' =>false,
            'type' => 'GRC',
        ];

        // Act
        $response = $this->putJson(route('user.update', $user->id), $data, [
            'x-api-key' => $this->apiKey, // Include the API key
        ]);

        // Assert
        $response->assertOk();
        unset($data['password']);  // Exclude password from the assertion
        $this->assertDatabaseHas('users', $data);

    }

    /** @test */
    public function it_can_soft_delete_and_force_delete_a_user()
    {
        // Arrange
        $user = User::factory()->create();
        $authUser = User::factory()->create();
        $this->actingAs($authUser, 'api');

        // Act: Soft delete
        $response = $this->deleteJson(route('user.destroy', $user->id), [], [
            'x-api-key' => $this->apiKey, // Include the API key
        ]);

        // Assert: Soft delete
        $response->assertOk();
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        // Act: Force delete
        $responseForceDelete = $this->deleteJson(route('user.destroy', $user->id), [
            'forceDelete' => true,
        ],[
            'x-api-key' => $this->apiKey, // Include the API key
        ]);

        // Assert: Force delete
        $responseForceDelete->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);

    }

    /** @test */
    public function it_can_login_with_valid_credentials()
    {
        // Arrange: Create a mock user in the database
        $user = User::factory()->create([
            'email' => 'editor@example.com',
            'password' => Hash::make('password'),
            'status' =>true,
            'is_locked' =>false,
            'type' => 'GRC',
        ]);

        // Act: Send a POST request with the user's credentials
        $response = $this->postJson(route('login'), [
            'login' => 'editor@example.com',
            'password' => 'password',
        ],[
            'x-api-key' => $this->apiKey, // Include the API key
        ]);

        // Assert: Check if the login is successful and contains the 'token'
        $response->assertOk();
        $response->assertJsonStructure([
            'status',
            'data' => [
                'expires_in',
                'token'
            ]
        ]);
    }

}
