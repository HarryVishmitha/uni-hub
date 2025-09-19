<?php

namespace Database\Seeders;

use App\Models\Curriculum;
use App\Models\CurriculumRequirement;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminId = User::where('email', 'super_admin@unihub.test')->value('id');

        $curricula = [
            [
                'program_title' => 'BSc Engineering (Civil)',
                'branch_code' => 'COL',
                'version' => '2025.v1',
                'status' => 'active',
                'min_credits' => 120,
                'notes' => ['year' => 2025],
                'requirements' => [
                    [
                        'code' => 'CIV101',
                        'title' => 'Structural Mechanics I',
                        'requirement_type' => 'core',
                        'credit_value' => 4,
                        'rules' => ['semester' => 1],
                    ],
                    [
                        'code' => 'CIV202',
                        'title' => 'Hydraulics',
                        'requirement_type' => 'core',
                        'credit_value' => 3,
                        'rules' => ['semester' => 3],
                    ],
                    [
                        'code' => 'CIV-ELECT',
                        'title' => 'Civil Engineering Elective',
                        'requirement_type' => 'elective',
                        'credit_value' => 3,
                        'rules' => ['group' => 'technical'],
                    ],
                ],
            ],
            [
                'program_title' => 'HND in Computer Science',
                'branch_code' => 'COL',
                'version' => '2025.v1',
                'status' => 'active',
                'min_credits' => 72,
                'notes' => ['cohort' => 'JAN-2025'],
                'requirements' => [
                    [
                        'code' => 'CS101',
                        'title' => 'Programming Fundamentals',
                        'requirement_type' => 'core',
                        'credit_value' => 4,
                        'rules' => ['semester' => 1],
                    ],
                    [
                        'code' => 'CS201',
                        'title' => 'Database Systems',
                        'requirement_type' => 'core',
                        'credit_value' => 3,
                        'rules' => ['semester' => 2],
                    ],
                    [
                        'code' => 'CS-ELECT',
                        'title' => 'Computing Elective',
                        'requirement_type' => 'elective',
                        'credit_value' => 3,
                        'rules' => ['group' => 'specialization'],
                    ],
                ],
            ],
            [
                'program_title' => 'BBA in Financial Management',
                'branch_code' => 'DXB',
                'version' => '2025.v1',
                'status' => 'active',
                'min_credits' => 96,
                'notes' => ['delivery' => 'trimester'],
                'requirements' => [
                    [
                        'code' => 'FIN101',
                        'title' => 'Principles of Finance',
                        'requirement_type' => 'core',
                        'credit_value' => 4,
                        'rules' => ['semester' => 1],
                    ],
                    [
                        'code' => 'ACC201',
                        'title' => 'Corporate Accounting',
                        'requirement_type' => 'core',
                        'credit_value' => 3,
                        'rules' => ['semester' => 2],
                    ],
                    [
                        'code' => 'BUS-ELECT',
                        'title' => 'Business Elective',
                        'requirement_type' => 'elective',
                        'credit_value' => 3,
                        'rules' => ['group' => 'business'],
                    ],
                ],
            ],
        ];

        foreach ($curricula as $data) {
            $program = Program::where('title', $data['program_title'])
                ->whereHas('branch', fn ($query) => $query->where('code', $data['branch_code']))
                ->first();

            if (! $program) {
                continue;
            }

            $curriculum = Curriculum::firstOrCreate(
                [
                    'program_id' => $program->id,
                    'version' => $data['version'],
                ],
                [
                    'branch_id' => $program->branch_id,
                    'status' => $data['status'],
                    'min_credits' => $data['min_credits'],
                    'notes' => $data['notes'],
                    'created_by' => $superAdminId,
                    'updated_by' => $superAdminId,
                ]
            );

            $curriculum->update([
                'status' => $data['status'],
                'min_credits' => $data['min_credits'],
                'notes' => $data['notes'],
                'updated_by' => $superAdminId,
            ]);

            foreach ($data['requirements'] as $requirement) {
                $model = CurriculumRequirement::firstOrCreate(
                    [
                        'curriculum_id' => $curriculum->id,
                        'code' => $requirement['code'],
                    ],
                    [
                        'branch_id' => $program->branch_id,
                        'title' => $requirement['title'],
                        'requirement_type' => $requirement['requirement_type'],
                        'credit_value' => $requirement['credit_value'],
                        'rules' => $requirement['rules'],
                        'is_required' => $requirement['requirement_type'] === 'core',
                        'created_by' => $superAdminId,
                        'updated_by' => $superAdminId,
                    ]
                );

                $model->update([
                    'title' => $requirement['title'],
                    'requirement_type' => $requirement['requirement_type'],
                    'credit_value' => $requirement['credit_value'],
                    'rules' => $requirement['rules'],
                    'is_required' => $requirement['requirement_type'] === 'core',
                    'updated_by' => $superAdminId,
                ]);
            }
        }
    }
}
