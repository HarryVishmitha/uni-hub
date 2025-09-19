<?php

use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\CurriculumController;
use App\Http\Controllers\Admin\DemoController;
use App\Http\Controllers\Admin\OrgUnitController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\UniversityController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'ensure_user_role'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::middleware(['role:super_admin|admin|branch_admin', 'acts_on_branch'])->group(function () {
            Route::get('dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
            Route::resource('branches', BranchController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('org-units', OrgUnitController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('programs', ProgramController::class)->only(['index', 'store', 'update', 'destroy']);

            Route::resource('curricula', CurriculumController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::post('curricula/{curriculum}/requirements', [CurriculumController::class, 'storeRequirement'])->name('curricula.requirements.store');
            Route::put('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'updateRequirement'])->name('curricula.requirements.update');
            Route::delete('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'destroyRequirement'])->name('curricula.requirements.destroy');
            
            // Demo routes
            Route::get('demo', [DemoController::class, 'index'])->name('demo.index');
            Route::post('demo/flash-alert', [DemoController::class, 'flashAlert'])->name('demo.flash-alert');
        });

        Route::middleware('role:super_admin')->group(function () {
            Route::resource('universities', UniversityController::class)->only(['index', 'store', 'update', 'destroy'])->names([
                'index' => 'universities.index',
                'store' => 'universities.store',
                'update' => 'universities.update',
                'destroy' => 'universities.destroy',
            ]);
            
            // Department routes (placeholder for super admin)
            Route::get('departments', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Departments']))->name('departments.index');
            
            // Courses routes (placeholder for super admin)
            Route::get('courses', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Courses']))->name('courses.index');
            
            // Requirements routes (placeholder for super admin)
            Route::get('requirements', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Requirements']))->name('requirements.index');
            
            // User management routes (placeholder for super admin)
            Route::get('students', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Students Management']))->name('students.index');
            Route::get('faculty', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Faculty Management']))->name('faculty.index');
            Route::get('staff', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Staff Management']))->name('staff.index');
            Route::get('enrollments', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Enrollments']))->name('enrollments.index');
            
            // System administration routes (placeholder for super admin)
            Route::get('users', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'User Accounts']))->name('users.index');
            Route::get('roles', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Roles & Permissions']))->name('roles.index');
            Route::get('settings', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'System Settings']))->name('settings.index');
            Route::get('audit-logs', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Audit Logs']))->name('audit-logs.index');
            
            // Tools routes (placeholder for super admin)
            Route::get('tools/import', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Import Data']))->name('tools.import');
            Route::get('tools/export', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Export Data']))->name('tools.export');
            Route::get('tools/health', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'System Health']))->name('tools.health');
        });
    });

    Route::middleware(['role:front_office'])->prefix('front-office')->name('front_office.')->group(function () {
        Route::get('dashboard', fn () => Inertia::render('FrontOffice/Dashboard'))->name('dashboard');
    });

    Route::middleware(['role:lecturer'])->prefix('lecturer')->name('lecturer.')->group(function () {
        Route::get('dashboard', fn () => Inertia::render('Lecturer/Dashboard'))->name('dashboard');
    });

    Route::middleware(['role:lab_manager'])->prefix('lab-manager')->name('lab_manager.')->group(function () {
        Route::get('dashboard', fn () => Inertia::render('LabManager/Dashboard'))->name('dashboard');
    });

    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', fn () => Inertia::render('Student/Dashboard'))->name('dashboard');
    });
});

require __DIR__.'/auth.php';
