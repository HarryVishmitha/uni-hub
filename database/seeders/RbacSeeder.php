<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
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

        // Create permissions
        $permissions = [
            'manage-users',
            'manage-roles',
            'manage-permissions',
            'manage-courses',
            'view-courses',
            'manage-departments',
            'view-departments',
            'manage-school',
            'view-school',
            'manage-enrollments',
            'view-enrollments',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $roles = [
            'admin' => $permissions,
            'staff' => [
                'manage-courses',
                'view-courses',
                'manage-departments',
                'view-departments',
                'manage-enrollments',
                'view-enrollments',
                'view-school',
            ],
            'student' => [
                'view-courses',
                'view-departments',
                'view-school',
                'view-enrollments',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::create(['name' => $roleName]);
            $role->givePermissionTo($rolePermissions);
        }

        // Create admin user
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@university.local',
            'password' => bcrypt('admin'),
        ]);

        $admin->assignRole('admin');
    }
}