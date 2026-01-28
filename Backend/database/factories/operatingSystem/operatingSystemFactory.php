<?php

namespace Database\Factories\operatingSystem;

use App\Models\operatingSystem\operatingSystem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\operatingSystem\operatingSystem>
 */
class operatingSystemFactory extends Factory
{
    protected $model = operatingSystem::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
        ];
    }
}
