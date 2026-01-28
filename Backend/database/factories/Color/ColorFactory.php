<?php

namespace Database\Factories\Color;

use App\Models\Color\Color;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Color\Color>
 */
class ColorFactory extends Factory
{
    protected $model = Color::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'hexcolor' => $this->faker->hexColor,
        ];
    }
}
