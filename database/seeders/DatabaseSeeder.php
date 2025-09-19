<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RbacSeeder::class,
            DemoUniversitySeeder::class,
            OrgTreeSeeder::class,
            ProgramSeeder::class,
            CurriculumSeeder::class,
            BranchUserBackfillSeeder::class,
        ]);
    }
}
