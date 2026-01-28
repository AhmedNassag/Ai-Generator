<?php

namespace Database\Factories\Job;

use App\Models\Job\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Job>
 */
class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition()
    {
        return [
            'name' => $this->faker->jobTitle,
        ];
    }
}
