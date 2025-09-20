<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Term;
use Illuminate\Database\Seeder;

class TermSeeder extends Seeder
{
    public function run(): void
    {
        if (Term::query()->exists()) {
            return;
        }

        Branch::query()->each(function (Branch $branch) {
            Term::factory()->state([
                'branch_id' => $branch->id,
                'status' => 'active',
                'title' => $branch->code.' Spring Term',
            ])->create();

            Term::factory()->state([
                'branch_id' => $branch->id,
                'status' => 'planned',
                'title' => $branch->code.' Fall Term',
            ])->create();
        });
    }
}
