<?php

namespace Database\Factories\Position;

use App\Models\Position\Position;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Position\Position>
 */
class PositionFactory extends Factory
{
    protected $model = Position::class;

    public function definition()
    {
        return [
            'name' => $this->faker->unique()->jobTitle,
            'code' => $this->faker->postcode,
            'description' => $this->faker->paragraph,
        ];
    }
}
