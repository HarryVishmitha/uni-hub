<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\{UserController, RoleController, PermissionController};
use App\Http\Controllers\{CourseController, DepartmentController, EnrollmentController};
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
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin routes
    Route::middleware(['role:staff'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);
    });

    // Staff routes
    Route::middleware(['role:staff|admin'])->prefix('staff')->name('staff.')->group(function () {
        Route::resource('courses', CourseController::class)->middleware('permission:manage-courses');
        Route::resource('departments', DepartmentController::class)->middleware('permission:manage-departments');
        Route::resource('enrollments', EnrollmentController::class)->middleware('permission:manage-enrollments');
    });

    // Student routes (view only)
    Route::middleware(['role:student|staff|admin'])->group(function () {
        Route::get('/courses', [CourseController::class, 'index'])->name('courses.index')->middleware('permission:view-courses');
        Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show')->middleware('permission:view-courses');
        Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index')->middleware('permission:view-departments');
        Route::get('/departments/{department}', [DepartmentController::class, 'show'])->name('departments.show')->middleware('permission:view-departments');
        Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index')->middleware('permission:view-enrollments');
    });
});

require __DIR__.'/auth.php';
