<?php

namespace Database\Factories;

use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\University>
 */
class UniversityFactory extends Factory
{
    protected $model = University::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->company.' University';

        return [
            'name' => $name,
            'code' => strtoupper($this->faker->unique()->lexify('??')).$this->faker->numberBetween(10, 99),
            'domain' => $this->faker->unique()->domainName(),
            'is_active' => true,
        ];
    }
}
