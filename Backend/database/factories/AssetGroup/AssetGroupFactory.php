<?php

namespace Database\Factories\AssetGroup;

use App\Models\Asset\Asset;
use App\Models\AssetGroup\AssetGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetGroupFactory extends Factory
{
    protected $model = AssetGroup::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (AssetGroup $assetGroup) {
            // Fetch all assets and shuffle them
            $assets = Asset::all()->shuffle()->take(3);
            $assetIds = $assets->pluck('_id')->toArray();

            // Attach the assets
            $assetGroup->assets()->attach($assetIds);
        });
    }
}
