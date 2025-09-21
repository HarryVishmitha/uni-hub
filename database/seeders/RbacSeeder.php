<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage-universities',
            'view-universities',
            'manage-branches',
            'view-branches',
            'manage-org-units',
            'view-org-units',
            'manage-programs',
            'view-programs',
            'manage-curricula',
            'view-curricula',
            'manage-terms',
            'view-terms',
            'manage-courses',
            'view-courses',
            'manage-users',
            'view-users',
            'manage-roles',
            'view-logs',
            'manage-permissions',
            'view-permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $roles = [
            'super_admin' => $permissions,
            'admin' => [
                'view-universities',
                'manage-branches',
                'view-branches',
                'manage-org-units',
                'view-org-units',
                'manage-programs',
                'view-programs',
                'manage-curricula',
                'view-curricula',
                'manage-terms',
                'view-terms',
                'manage-courses',
                'view-courses',
                'manage-users',
                'view-users',
                'manage-roles',
                'manage-permissions',
                'view-permissions',
                'view-logs',
            ],
            'branch_admin' => [
                'view-branches',
                'manage-org-units',
                'view-org-units',
                'manage-programs',
                'view-programs',
                'manage-curricula',
                'view-curricula',
                'manage-terms',
                'view-terms',
                'manage-courses',
                'view-courses',
                'view-users',
            ],
            'front_office' => [
                'view-branches',
                'view-org-units',
                'view-programs',
                'view-curricula',
            ],
            'lecturer' => [
                'view-org-units',
                'view-programs',
                'view-curricula',
            ],
            'lab_manager' => [
                'view-org-units',
                'view-programs',
            ],
            'student' => [
                'view-programs',
                'view-curricula',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);

            $role->syncPermissions($rolePermissions);
        }

        $superAdmin = User::firstOrCreate(
            ['email' => 'super_admin@unihub.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
            ]
        );

        $superAdmin->syncRoles(['super_admin']);
    }
}
