<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<\App\Models\Term>
 */
class TermFactory extends Factory
{
    protected $model = Term::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(Term::STATUSES);
        $start = Carbon::now()->startOfMonth()->addMonths($this->faker->numberBetween(-3, 3));
        $end = (clone $start)->addMonths($this->faker->numberBetween(2, 4));
        $addDropStart = (clone $start)->addDays(1);
        $addDropEnd = (clone $addDropStart)->addDays(7);

        return [
            'branch_id' => Branch::factory(),
            'title' => $this->faker->unique()->words(3, true).' Term',
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'add_drop_start' => $addDropStart->toDateString(),
            'add_drop_end' => $addDropEnd->toDateString(),
            'status' => $status,
        ];
    }

    public function active(): self
    {
        return $this->state(fn () => ['status' => 'active']);
    }
}
