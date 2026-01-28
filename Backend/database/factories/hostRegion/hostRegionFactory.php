<?php

namespace Database\Factories\hostRegion;

use App\Models\hostRegion\hostRegion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\hostRegion\hostRegion>
 */
class hostRegionFactory extends Factory
{
    protected $model = hostRegion::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
        ];
    }
}
