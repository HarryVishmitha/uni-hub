<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\OrgUnit;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        if (Course::query()->exists()) {
            return;
        }

        $orgUnits = OrgUnit::query()->with('branch')->get();

        foreach ($orgUnits as $orgUnit) {
            Course::factory()
                ->count(2)
                ->state([
                    'org_unit_id' => $orgUnit->id,
                    'status' => 'active',
                ])
                ->create();
        }
    }
}
