<?php

namespace Database\Factories;

use App\Models\Department\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department\Department>
 */
class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            // unqiue:departments code
            'code' => $this->faker->unique()->word,
            'type' => $this->faker->randomElement(['GRC', 'LDAP']),
            'color_id' => $this->faker->numberBetween(1, 255),
            'parent_id' => $this->faker->numberBetween(1, 255),
            'manager_id' => $this->faker->numberBetween(1, 255),
            // array:jobs _ids key and value in the array
            'job_ids' => $this->faker->words(3),
            'nubmer_of_employees' => $this->faker->numberBetween(1, 100),
            'vision' => $this->faker->text(10000),
            'message' => $this->faker->text(10000),
            'mission' => $this->faker->text(10000),
            'objectives' => $this->faker->text(10000),
            'responsibilities' => $this->faker->text(10000),
        ];
    }
}
