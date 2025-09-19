<?php

use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\CurriculumController;
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
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::middleware(['role:super_admin|admin|branch_admin', 'acts_on_branch'])->group(function () {
            Route::get('/dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
            Route::resource('branches', BranchController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('org-units', OrgUnitController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('programs', ProgramController::class)->only(['index', 'store', 'update', 'destroy']);

            Route::resource('curricula', CurriculumController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::post('curricula/{curriculum}/requirements', [CurriculumController::class, 'storeRequirement'])->name('curricula.requirements.store');
            Route::put('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'updateRequirement'])->name('curricula.requirements.update');
            Route::delete('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'destroyRequirement'])->name('curricula.requirements.destroy');
        });

        Route::middleware('role:super_admin')->group(function () {
            Route::resource('universities', UniversityController::class)->only(['index', 'store', 'update', 'destroy']);
        });
    });

    Route::middleware(['role:front_office'])->prefix('front-office')->name('front_office.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('FrontOffice/Dashboard'))->name('dashboard');
    });

    Route::middleware(['role:lecturer'])->prefix('lecturer')->name('lecturer.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Lecturer/Dashboard'))->name('dashboard');
    });

    Route::middleware(['role:lab_manager'])->prefix('lab-manager')->name('lab_manager.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('LabManager/Dashboard'))->name('dashboard');
    });

    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Student/Dashboard'))->name('dashboard');
    });
});

require __DIR__.'/auth.php';
