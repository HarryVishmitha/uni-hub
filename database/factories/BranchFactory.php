<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Branch>
 */
class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'university_id' => University::factory(),
            'name' => $this->faker->city().' Campus',
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'country' => $this->faker->country(),
            'city' => $this->faker->city(),
            'timezone' => $this->faker->timezone(),
            'theme_tokens' => [],
            'feature_flags' => [],
            'is_active' => true,
        ];
    }
}
