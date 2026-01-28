<?php

namespace Database\Factories\Risk;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Risk\Risk>
 */
class RiskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
        'risk_number' => $this->faker->numberBetween(100, 2000),
        'subject' => $this->faker->text(100),
        'reference_id' => $this->faker->numberBetween(1, 255),
        'current_impact' => rand(0 , 4),
        'current_likelihood' => rand(0 , 4),
        'responsible_party',
        'kips' => $this->faker->text(100),
        'description' => $this->faker->text(100),
        'mitigation_cost' => $this->faker->numberBetween(10, 20),
        'mitigation_percent' => $this->faker->numberBetween(10, 20),
        'current_solution' => $this->faker->text(100),
        'security_recommendations' => $this->faker->text(100),
        'security_requirements' => $this->faker->text(100),
        'next_review' => $this->faker->date(),
        'next_review_date' => $this->faker->date(),
        'comments' => $this->faker->text(100),
        'status' => $this->faker->randomElement(['New', 'Mitigation Planned' , 'Mgmt Reviewed', 'Closed Risk', 'Reopened', 'Reject']),
        ];
    }
}
