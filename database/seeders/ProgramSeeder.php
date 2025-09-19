<?php

namespace Database\Seeders;

use App\Models\OrgUnit;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminId = User::where('email', 'super_admin@unihub.test')->value('id');

        $programs = [
            [
                'org_unit_code' => 'CIV',
                'branch_code' => 'COL',
                'title' => 'BSc Engineering (Civil)',
                'description' => 'Four-year honours programme in Civil Engineering.',
                'level' => 'Undergraduate',
                'modality' => 'On Campus',
                'duration_months' => 48,
                'status' => 'active',
            ],
            [
                'org_unit_code' => 'CS',
                'branch_code' => 'COL',
                'title' => 'HND in Computer Science',
                'description' => 'Higher National Diploma focusing on software development and systems.',
                'level' => 'Diploma',
                'modality' => 'Hybrid',
                'duration_months' => 24,
                'status' => 'active',
            ],
            [
                'org_unit_code' => 'ACC',
                'branch_code' => 'DXB',
                'title' => 'BBA in Financial Management',
                'description' => 'Business administration programme with a finance specialization.',
                'level' => 'Undergraduate',
                'modality' => 'On Campus',
                'duration_months' => 36,
                'status' => 'active',
            ],
        ];

        foreach ($programs as $data) {
            $orgUnit = OrgUnit::where('code', $data['org_unit_code'])
                ->whereHas('branch', fn ($query) => $query->where('code', $data['branch_code']))
                ->first();

            if (! $orgUnit) {
                continue;
            }

            $program = Program::firstOrCreate(
                [
                    'org_unit_id' => $orgUnit->id,
                    'title' => $data['title'],
                ],
                [
                    'branch_id' => $orgUnit->branch_id,
                    'description' => $data['description'],
                    'level' => $data['level'],
                    'modality' => $data['modality'],
                    'duration_months' => $data['duration_months'],
                    'status' => $data['status'],
                    'created_by' => $superAdminId,
                    'updated_by' => $superAdminId,
                ]
            );

            $program->update([
                'description' => $data['description'],
                'level' => $data['level'],
                'modality' => $data['modality'],
                'duration_months' => $data['duration_months'],
                'status' => $data['status'],
                'updated_by' => $superAdminId,
            ]);
        }
    }
}
