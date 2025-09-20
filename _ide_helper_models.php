<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $university_id
 * @property string $name
 * @property string $code
 * @property string|null $country
 * @property string|null $city
 * @property string $timezone
 * @property array<array-key, mixed>|null $theme_tokens
 * @property array<array-key, mixed>|null $feature_flags
 * @property bool $is_active
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Curriculum> $curricula
 * @property-read int|null $curricula_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrgUnit> $orgUnits
 * @property-read int|null $org_units_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Program> $programs
 * @property-read int|null $programs_count
 * @property-read \App\Models\University $university
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Database\Factories\BranchFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereFeatureFlags($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereThemeTokens($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereTimezone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereUniversityId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Branch withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperBranch {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $org_unit_id
 * @property string $code
 * @property string $title
 * @property int $credit_hours
 * @property string $delivery_mode
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \App\Models\CoursePrerequisite|null $pivot
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Course> $dependentCourses
 * @property-read int|null $dependent_courses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Enrollment> $enrollments
 * @property-read int|null $enrollments_count
 * @property-read int|null $branch_id
 * @property-read \App\Models\OrgUnit $orgUnit
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseOutcome> $outcomes
 * @property-read int|null $outcomes_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Course> $prerequisites
 * @property-read int|null $prerequisites_count
 * @method static \Database\Factories\CourseFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereCreditHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereDeliveryMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereOrgUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCourse {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string $outcome_code
 * @property string $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \App\Models\Course $course
 * @method static \Database\Factories\CourseOutcomeFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome whereOutcomeCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseOutcome whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCourseOutcome {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property int $prereq_course_id
 * @property string|null $min_grade
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \App\Models\Course $course
 * @property-read \App\Models\Course $prerequisite
 * @method static \Database\Factories\CoursePrerequisiteFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite whereMinGrade($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite wherePrereqCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CoursePrerequisite whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCoursePrerequisite {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $branch_id
 * @property int $program_id
 * @property string $version
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $effective_from
 * @property int|null $min_credits
 * @property array<array-key, mixed>|null $notes
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Branch $branch
 * @property-read \App\Models\Program $program
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CurriculumRequirement> $requirements
 * @property-read int|null $requirements_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereBranchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereEffectiveFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereMinCredits($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereProgramId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum whereVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Curriculum withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCurriculum {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $branch_id
 * @property int $curriculum_id
 * @property string|null $code
 * @property string $title
 * @property string $requirement_type
 * @property int|null $credit_value
 * @property array<array-key, mixed>|null $rules
 * @property bool $is_required
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Branch $branch
 * @property-read \App\Models\Curriculum $curriculum
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereBranchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereCreditValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereCurriculumId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereIsRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereRequirementType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereRules($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurriculumRequirement withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCurriculumRequirement {}
}

namespace App\Models{
/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Course> $courses
 * @property-read int|null $courses_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department query()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperDepartment {}
}

namespace App\Models{
/**
 * @property-read \App\Models\Course|null $course
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Enrollment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Enrollment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Enrollment query()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperEnrollment {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $branch_id
 * @property int|null $parent_id
 * @property string $name
 * @property string $code
 * @property string $type
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \App\Models\Branch $branch
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrgUnit> $children
 * @property-read int|null $children_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Course> $courses
 * @property-read int|null $courses_count
 * @property-read OrgUnit|null $parent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Program> $programs
 * @property-read int|null $programs_count
 * @method static \Database\Factories\OrgUnitFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereBranchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrgUnit withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrgUnit {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $branch_id
 * @property int $org_unit_id
 * @property string $title
 * @property string|null $description
 * @property string|null $level
 * @property string|null $modality
 * @property int|null $duration_months
 * @property string $status
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \App\Models\Branch $branch
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Curriculum> $curricula
 * @property-read int|null $curricula_count
 * @property-read \App\Models\OrgUnit $orgUnit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereBranchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereDurationMonths($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereModality($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereOrgUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Program withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProgram {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $branch_id
 * @property string $title
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon $end_date
 * @property \Illuminate\Support\Carbon|null $add_drop_start
 * @property \Illuminate\Support\Carbon|null $add_drop_end
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \App\Models\Branch $branch
 * @method static \Database\Factories\TermFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereAddDropEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereAddDropStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereBranchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Term withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperTerm {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $domain
 * @property bool $is_active
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Branch> $branches
 * @property-read int|null $branches_count
 * @method static \Database\Factories\UniversityFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereDomain($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|University withoutTrashed()
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperUniversity {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $branch_id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Branch|null $branch
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBranchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperUser {}
}

