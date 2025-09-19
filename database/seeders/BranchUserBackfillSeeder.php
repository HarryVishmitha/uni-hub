<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BranchUserBackfillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::where('email', 'super_admin@unihub.test')->first();
        $defaultBranch = Branch::where('code', 'COL')->first();

        if ($defaultBranch) {
            User::query()
                ->whereNull('branch_id')
                ->when($superAdmin, fn ($query) => $query->whereNot('id', $superAdmin->id))
                ->update(['branch_id' => $defaultBranch->id]);
        }

        $branchAdmins = [
            [
                'email' => 'col-admin@unihub.test',
                'name' => 'Colombo Branch Admin',
                'branch_code' => 'COL',
            ],
            [
                'email' => 'dxb-admin@unihub.test',
                'name' => 'Dubai Branch Admin',
                'branch_code' => 'DXB',
            ],
        ];

        foreach ($branchAdmins as $data) {
            $branch = Branch::where('code', $data['branch_code'])->first();

            if (! $branch) {
                continue;
            }

            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'branch_id' => $branch->id,
                ]
            );

            $user->update(['branch_id' => $branch->id]);
            $user->syncRoles(['branch_admin']);
        }
    }
}
