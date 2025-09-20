<?php

namespace Tests\Unit;

use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\StoreTermRequest;
use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ValidationRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_term_dates_must_be_coherent(): void
    {
        $this->seed(RbacSeeder::class);

        $branch = Branch::factory()->create();
        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole('branch_admin');

        $request = StoreTermRequest::create('/admin/terms', 'POST', [
            'branch_id' => $branch->id,
            'title' => 'Invalid Term',
            'start_date' => '2025-05-10',
            'end_date' => '2025-05-05',
            'add_drop_start' => '2025-05-01',
            'add_drop_end' => '2025-05-04',
            'status' => 'planned',
        ]);

        $request->setUserResolver(fn () => $user);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $this->expectException(ValidationException::class);
        $request->validateResolved();
    }

    public function test_course_code_must_be_unique_per_org_unit(): void
    {
        $this->seed(RbacSeeder::class);

        $branch = Branch::factory()->create();
        $orgUnit = OrgUnit::factory()->state(['branch_id' => $branch->id])->create();
        $course = Course::factory()->state([
            'org_unit_id' => $orgUnit->id,
            'code' => 'CSC101',
        ])->create();

        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole('branch_admin');

        $request = StoreCourseRequest::create('/admin/courses', 'POST', [
            'org_unit_id' => $orgUnit->id,
            'code' => 'csc101',
            'title' => 'Duplicate Course',
            'credit_hours' => 3,
            'delivery_mode' => 'onsite',
            'status' => 'draft',
        ]);

        $request->setUserResolver(fn () => $user);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $this->expectException(ValidationException::class);
        $request->validateResolved();
    }
}
