<?php

namespace Database\Factories\AssetEnvironmentCategory;

use App\Models\AssetEnvironmentCategory\AssetEnvironmentCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetEnvironmentCategory\AssetEnvironmentCategory>
 */
class AssetEnvironmentCategoryFactory extends Factory
{
    protected $model = AssetEnvironmentCategory::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
        ];
    }
}
