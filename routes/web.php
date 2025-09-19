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
        Route::middleware('role:super_admin')->group(function () {
            Route::resource('universities', UniversityController::class)->only(['index', 'store', 'update', 'destroy']);
        });

        Route::middleware(['role:super_admin|branch_admin', 'acts_on_branch'])->group(function () {
            Route::resource('branches', BranchController::class)->only(['index', 'store', 'update', 'destroy']);
        });

        Route::middleware(['role:super_admin|admin|branch_admin', 'acts_on_branch'])->group(function () {
            Route::resource('org-units', OrgUnitController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('programs', ProgramController::class)->only(['index', 'store', 'update', 'destroy']);

            Route::resource('curricula', CurriculumController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::post('curricula/{curriculum}/requirements', [CurriculumController::class, 'storeRequirement'])->name('curricula.requirements.store');
            Route::put('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'updateRequirement'])->name('curricula.requirements.update');
            Route::delete('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'destroyRequirement'])->name('curricula.requirements.destroy');
        });
    });
});

require __DIR__.'/auth.php';
