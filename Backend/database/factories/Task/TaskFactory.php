<?php

namespace Database\Factories\Task;

use App\Models\Task\Task;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition()
    {
        // Randomly decide whether to assign to a user or team
        $assignType = $this->faker->randomElement([1, 2]); // 1 => user, 2 => team

        // Fetch a random user or team ID based on the assign_type
        if ($assignType == 1) {
            $assigneeId = \App\Models\User\User::all()->random()->_id;
        } else {
            $assigneeId = \App\Models\Team\Team::all()->random()->_id;
        }

        return [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph(5), // Ensure description is within 1000 characters
            'category_id' => \App\Models\Category\Category::all()->random()->_id,
            'assign_type' => $assignType,
            'assignee_id' => $assigneeId,
            'start_date' => $this->faker->dateTimeBetween('now', '+1 month')->format('Y-m-d'), // Start date must be today or later
            'due_date' => $this->faker->dateTimeBetween('+1 month', '+2 months')->format('Y-m-d'), // Due date must be after start_date
            'priority' => $this->faker->numberBetween(1, 5), // Priority between 1 and 5
            'status' => $this->faker->randomElement([1, 2, 3]), // Status: 1 (open), 2 (in progress), 3 (completed)
        ];
    }
}
