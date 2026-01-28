<?php

namespace Database\Factories\assetCategory;

use App\Models\assetCategory\assetCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\assetCategory\assetCategory>
 */
class assetCategoryFactory extends Factory
{
    protected $model = assetCategory::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
        ];
    }
}
