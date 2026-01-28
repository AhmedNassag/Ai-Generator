<?php

namespace Database\Factories\Asset;

use App\Models\Asset\Asset;
use App\Models\assetCategory\assetCategory;
use App\Models\AssetEnvironmentCategory\AssetEnvironmentCategory;
use App\Models\Team\Team;
use App\Models\User\User;
use App\Models\operatingSystem\operatingSystem;
use App\Models\Location\Location;
use App\Models\hostRegion\hostRegion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asset\Asset>
 */
class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'ip_address' => $this->faker->ipv4,
            'asset_value' => $this->faker->randomFloat(2, 1000, 10000),
            'asset_category_id' => assetCategory::all()->random()->_id,
            'asset_environment_category_id' => AssetEnvironmentCategory::all()->random()->_id,
            'tags' => implode(',', $this->faker->words(3)),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'alert_period' => $this->faker->numberBetween(1, 30),
            'owner_id' => User::all()->random()->_id,
            'url' => $this->faker->url,
            'operating_system_id' => operatingSystem::all()->random()->_id,
            'os_version' => $this->faker->word,
            'type' => $this->faker->randomElement(['physical', 'virtual']),
            'project_vlan' => $this->faker->word,
            'vlan' => $this->faker->word,
            'vendor_name' => $this->faker->company,
            'model' => $this->faker->word,
            'firmware' => $this->faker->word,
            'location_id' => Location::all()->random()->_id,
            'rack_location' => $this->faker->word,
            'city' => $this->faker->city,
            'mac_address' => $this->faker->macAddress,
            'subnet_mask' => $this->faker->ipv4,
            'details' => $this->faker->sentence,
            'host_region_id' => hostRegion::all()->random()->_id,
            'team_ids' => [], // Ensure this field is always an array
            'asset_group_ids' => [],
            'vulnerability_ids' => [],
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Asset $asset) {
            // Fetch all teams and take 2 random teams
            $teamIds = Team::all()->pluck('_id')->shuffle()->take(2)->toArray();

            // Ensure 'asset_ids' field on Team is always an array
            Team::whereIn('_id', $teamIds)->each(function ($team) use ($asset) {
                if (!is_array($team->asset_ids)) {
                    $team->asset_ids = []; // Make sure it's an array
                }
                $team->asset_ids = array_merge($team->asset_ids, [$asset->_id]);
                $team->save();
            });

            // Attach teams to the relationship
            $asset->teams()->attach($teamIds);
        });
    }
}
