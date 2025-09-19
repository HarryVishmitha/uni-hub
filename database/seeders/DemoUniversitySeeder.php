<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminId = User::where('email', 'super_admin@unihub.test')->value('id');

        $university = University::firstOrCreate(
            ['code' => 'UNI-HUB'],
            [
                'name' => 'UniHub Global University',
                'domain' => 'unihub.test',
                'is_active' => true,
                'created_by' => $superAdminId,
                'updated_by' => $superAdminId,
            ]
        );

        $university->update([
            'name' => 'UniHub Global University',
            'domain' => 'unihub.test',
            'is_active' => true,
            'updated_by' => $superAdminId,
        ]);

        $branches = [
            [
                'code' => 'COL',
                'name' => 'Colombo Campus',
                'country' => 'Sri Lanka',
                'city' => 'Colombo',
                'timezone' => 'Asia/Colombo',
                'theme_tokens' => [
                    'primary' => '#1d4ed8',
                    'secondary' => '#f59e0b',
                    'sidebar' => '#111827',
                ],
                'feature_flags' => [
                    'applications' => true,
                    'labs' => true,
                ],
            ],
            [
                'code' => 'DXB',
                'name' => 'Dubai Campus',
                'country' => 'United Arab Emirates',
                'city' => 'Dubai',
                'timezone' => 'Asia/Dubai',
                'theme_tokens' => [
                    'primary' => '#047857',
                    'secondary' => '#0ea5e9',
                    'sidebar' => '#1f2937',
                ],
                'feature_flags' => [
                    'applications' => true,
                    'labs' => false,
                ],
            ],
        ];

        foreach ($branches as $branchData) {
            $branch = Branch::firstOrCreate(
                [
                    'code' => $branchData['code'],
                    'university_id' => $university->id,
                ],
                [
                    ...$branchData,
                    'university_id' => $university->id,
                    'is_active' => true,
                    'created_by' => $superAdminId,
                    'updated_by' => $superAdminId,
                ]
            );

            $branch->update([
                'name' => $branchData['name'],
                'country' => $branchData['country'],
                'city' => $branchData['city'],
                'timezone' => $branchData['timezone'],
                'theme_tokens' => $branchData['theme_tokens'],
                'feature_flags' => $branchData['feature_flags'],
                'is_active' => true,
                'updated_by' => $superAdminId,
            ]);
        }
    }
}
