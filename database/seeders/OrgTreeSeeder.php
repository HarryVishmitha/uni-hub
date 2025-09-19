<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\OrgUnit;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrgTreeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminId = User::where('email', 'super_admin@unihub.test')->value('id');

        $trees = [
            'COL' => [
                [
                    'code' => 'ENG',
                    'name' => 'Faculty of Engineering',
                    'type' => 'faculty',
                    'children' => [
                        [
                            'code' => 'CIV',
                            'name' => 'Department of Civil Engineering',
                            'type' => 'department',
                        ],
                    ],
                ],
                [
                    'code' => 'COMP',
                    'name' => 'School of Computing',
                    'type' => 'school',
                    'children' => [
                        [
                            'code' => 'HND',
                            'name' => 'HND Division',
                            'type' => 'division',
                            'children' => [
                                [
                                    'code' => 'CS',
                                    'name' => 'Department of Computer Science',
                                    'type' => 'department',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'DXB' => [
                [
                    'code' => 'BUS',
                    'name' => 'School of Business',
                    'type' => 'school',
                    'children' => [
                        [
                            'code' => 'FIN',
                            'name' => 'Division of Finance',
                            'type' => 'division',
                            'children' => [
                                [
                                    'code' => 'ACC',
                                    'name' => 'Department of Accounting',
                                    'type' => 'department',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($trees as $branchCode => $units) {
            $branch = Branch::where('code', $branchCode)->first();

            if (! $branch) {
                continue;
            }

            foreach ($units as $unit) {
                $this->createUnit($branch->id, $unit, $superAdminId);
            }
        }
    }

    private function createUnit(int $branchId, array $data, ?int $userId, ?int $parentId = null): OrgUnit
    {
        $orgUnit = OrgUnit::firstOrCreate(
            [
                'code' => $data['code'],
                'branch_id' => $branchId,
            ],
            [
                'name' => $data['name'],
                'type' => $data['type'],
                'branch_id' => $branchId,
                'parent_id' => $parentId,
                'created_by' => $userId,
                'updated_by' => $userId,
            ]
        );

        $orgUnit->update([
            'name' => $data['name'],
            'type' => $data['type'],
            'parent_id' => $parentId,
            'updated_by' => $userId,
        ]);

        if (! empty($data['children'])) {
            foreach ($data['children'] as $child) {
                $this->createUnit($branchId, $child, $userId, $orgUnit->id);
            }
        }

        return $orgUnit;
    }
}
