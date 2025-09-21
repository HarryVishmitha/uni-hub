<?php

use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\CourseOutcomeController;
use App\Http\Controllers\Admin\CoursePrerequisiteController;
use App\Http\Controllers\Admin\CurriculumController;
use App\Http\Controllers\Admin\DashboardApiController;
use App\Http\Controllers\Admin\DemoController;
use App\Http\Controllers\Admin\OrgUnitController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\ProgramEnrollmentController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoomApiController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\SectionApiController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SectionEnrollmentController;
use App\Http\Controllers\Admin\SectionMeetingController;
use App\Http\Controllers\Admin\TermController;
use App\Http\Controllers\Admin\TranscriptController;
use App\Http\Controllers\Admin\UniversityController;
use App\Http\Controllers\Account\CourseController as AccountCourseController;
use App\Http\Controllers\Account\TimetableController as AccountTimetableController;
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

    Route::middleware(['role:student'])->group(function () {
        Route::get('/account/my-courses', [AccountCourseController::class, 'index'])->name('account.courses.index');
        Route::get('/account/my-timetable', [AccountTimetableController::class, 'index'])->name('account.timetable.index');
        Route::get('/account/my-timetable/ics', [AccountTimetableController::class, 'ics'])->name('account.timetable.ics');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::middleware(['role:super_admin|admin|branch_admin', 'acts_on_branch'])->group(function () {
            Route::get('dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
            Route::resource('branches', BranchController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('org-units', OrgUnitController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('programs', ProgramController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::get('programs/{program}/enrollments', [ProgramEnrollmentController::class, 'index'])->name('programs.enrollments.index');
            Route::post('programs/{program}/enrollments', [ProgramEnrollmentController::class, 'store'])->name('programs.enrollments.store');
            Route::patch('program-enrollments/{program_enrollment}', [ProgramEnrollmentController::class, 'update'])->name('programs.enrollments.update');
            Route::delete('programs/{program}/enrollments/{program_enrollment}', [ProgramEnrollmentController::class, 'destroy'])->name('programs.enrollments.destroy');

            Route::resource('curricula', CurriculumController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::post('curricula/{curriculum}/requirements', [CurriculumController::class, 'storeRequirement'])->name('curricula.requirements.store');
            Route::put('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'updateRequirement'])->name('curricula.requirements.update');
            Route::delete('curricula/{curriculum}/requirements/{requirement}', [CurriculumController::class, 'destroyRequirement'])->name('curricula.requirements.destroy');

            Route::prefix('api')->name('api.')->group(function () {
                Route::get('metrics', [DashboardApiController::class, 'metrics'])->name('metrics');
                Route::get('activities', [DashboardApiController::class, 'activities'])->name('activities');
                Route::get('quick-actions', [DashboardApiController::class, 'quickActions'])->name('quick-actions');
                Route::get('rooms', [RoomApiController::class, 'index'])->name('rooms.index');
                Route::post('sections/{section}/conflicts', [SectionApiController::class, 'conflicts'])->name('sections.conflicts');
                Route::get('sections/{section}/ics', [SectionApiController::class, 'ics'])->name('sections.ics');
            });

            Route::post('terms/bulk-status', [TermController::class, 'bulkStatus'])->name('terms.bulk-status');
            Route::resource('terms', TermController::class)->except(['show']);

            Route::resource('courses', AdminCourseController::class);
            Route::post('courses/{course}/outcomes', [CourseOutcomeController::class, 'store'])->name('courses.outcomes.store');
            Route::put('courses/{course}/outcomes/{outcome}', [CourseOutcomeController::class, 'update'])->name('courses.outcomes.update');
            Route::delete('courses/{course}/outcomes/{outcome}', [CourseOutcomeController::class, 'destroy'])->name('courses.outcomes.destroy');
            Route::post('courses/{course}/prerequisites', [CoursePrerequisiteController::class, 'store'])->name('courses.prerequisites.store');
            Route::delete('courses/{course}/prerequisites/{prerequisite}', [CoursePrerequisiteController::class, 'destroy'])->name('courses.prerequisites.destroy');

            Route::resource('rooms', RoomController::class)->except(['show']);

            Route::post('sections/bulk-status', [SectionController::class, 'bulkStatus'])->name('sections.bulk-status');
            Route::get('sections/{section}/roster/manage', [SectionController::class, 'roster'])->name('sections.roster.manage');
            Route::resource('sections', SectionController::class);

            Route::post('sections/{section}/enroll', [SectionEnrollmentController::class, 'store'])->name('sections.enroll');
            Route::post('sections/{section}/enrollments/bulk', [SectionEnrollmentController::class, 'bulk'])->name('sections.enrollments.bulk');
            Route::patch('sections/{section}/enrollments/{enrollment}', [SectionEnrollmentController::class, 'update'])->name('sections.enrollments.update');
            Route::delete('sections/{section}/enrollments/{enrollment}', [SectionEnrollmentController::class, 'destroy'])->name('sections.enrollments.destroy');
            Route::get('sections/{section}/roster', [SectionEnrollmentController::class, 'roster'])->name('sections.roster');

            Route::post('sections/{section}/meetings', [SectionMeetingController::class, 'store'])->name('sections.meetings.store');
            Route::put('sections/{section}/meetings/{meeting}', [SectionMeetingController::class, 'update'])->name('sections.meetings.update');
            Route::delete('sections/{section}/meetings/{meeting}', [SectionMeetingController::class, 'destroy'])->name('sections.meetings.destroy');

            Route::post('sections/{section}/appointments', [AppointmentController::class, 'store'])->name('sections.appointments.store');
            Route::put('sections/{section}/appointments/{appointment}', [AppointmentController::class, 'update'])->name('sections.appointments.update');
            Route::delete('sections/{section}/appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('sections.appointments.destroy');

            Route::get('transcripts', [TranscriptController::class, 'index'])->name('transcripts.index');
            Route::post('transcripts', [TranscriptController::class, 'store'])->name('transcripts.store');
            Route::patch('transcripts/{transcript}', [TranscriptController::class, 'update'])->name('transcripts.update');
            Route::delete('transcripts/{transcript}', [TranscriptController::class, 'destroy'])->name('transcripts.destroy');
            
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
            // Requirements routes (placeholder for super admin)
            Route::get('requirements', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Requirements']))->name('requirements.index');
            
            // User management routes (placeholder for super admin)
            Route::get('students', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Students Management']))->name('students.index');
            Route::get('faculty', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Faculty Management']))->name('faculty.index');
            Route::get('staff', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Staff Management']))->name('staff.index');
            Route::get('enrollments', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'Enrollments']))->name('enrollments.index');

            // System administration routes (placeholder for super admin)
            Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('permissions', PermissionController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::get('settings', fn () => Inertia::render('Admin/ComingSoon', ['feature' => 'System Settings']))->name('settings.index');
            Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
            
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
