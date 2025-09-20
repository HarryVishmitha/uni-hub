import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Create() {
  const { props } = usePage();
  const {
    statusOptions = [],
    deliveryModeOptions = [],
    branchOptions = [],
    orgUnitTree = {},
    availableCourses = [],
  } = props;

  const firstBranchKey = branchOptions?.[0]?.id ?? Object.keys(orgUnitTree)[0] ?? '';
  const [step, setStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(firstBranchKey ? String(firstBranchKey) : '');
  const [outcomes, setOutcomes] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [outcomeDraft, setOutcomeDraft] = useState({ outcome_code: '', description: '' });
  const [prerequisiteDraft, setPrerequisiteDraft] = useState({ prereq_course_id: '', min_grade: '' });
  const [stepError, setStepError] = useState('');

  const { data, setData, post, processing, errors } = useForm({
    org_unit_id: '',
    code: '',
    title: '',
    credit_hours: 3,
    delivery_mode: deliveryModeOptions[0] ?? 'onsite',
    status: statusOptions[0] ?? 'draft',
    outcomes: [],
    prerequisites: [],
  });

  const orgUnitOptions = useMemo(() => flattenOrgUnits(orgUnitTree[selectedBranch] ?? []), [selectedBranch, orgUnitTree]);
  const branchMap = useMemo(() => new Map(branchOptions.map((branch) => [String(branch.id), branch])), [branchOptions]);
  const filteredPrerequisiteCourses = useMemo(() => filterAvailableCourses(availableCourses, selectedBranch), [availableCourses, selectedBranch]);

  useMemo(() => {
    if (!data.org_unit_id && orgUnitOptions.length > 0) {
      setData('org_unit_id', orgUnitOptions[0].id);
    }
  }, [orgUnitOptions]);

  const handleNext = () => {
    setStepError('');

    if (step === 1) {
      if (!data.org_unit_id || !data.code || !data.title) {
        setStepError('Org unit, code, and title are required.');
        return;
      }
    }

    setStep((current) => Math.min(current + 1, 3));
  };

  const handlePrevious = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const submit = (event) => {
    event.preventDefault();

    post(route('admin.courses.store'), {
      preserveScroll: true,
      data: {
        ...data,
        code: data.code.toUpperCase(),
        outcomes: outcomes.map(({ outcome_code, description }) => ({
          outcome_code: outcome_code.toUpperCase(),
          description,
        })),
        prerequisites: prerequisites.map(({ prereq_course_id, min_grade }) => ({
          prereq_course_id,
          min_grade,
        })),
      },
    });
  };

  return (
    <AdminLayout title="Create Course" header="Create Course">
      <Head title="Create Course" />

      <div className="mx-auto max-w-4xl">
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Builder</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Walk through the steps to provision a new course.</p>
            </div>
            <Link
              href={route('admin.courses.index')}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              Back to Catalog
            </Link>
          </div>

          <WizardSteps current={step} />

          {step === 1 && (
            <StepBasics
              data={data}
              setData={setData}
              errors={errors}
              branchOptions={branchOptions}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              orgUnitOptions={orgUnitOptions}
              deliveryModeOptions={deliveryModeOptions}
              statusOptions={statusOptions}
              branchMap={branchMap}
            />
          )}

          {step === 2 && (
            <StepOutcomes
              outcomes={outcomes}
              setOutcomes={setOutcomes}
              draft={outcomeDraft}
              setDraft={setOutcomeDraft}
              errors={errors}
            />
          )}

          {step === 3 && (
            <StepPrereqs
              prerequisites={prerequisites}
              setPrerequisites={setPrerequisites}
              courses={filteredPrerequisiteCourses}
              draft={prerequisiteDraft}
              setDraft={setPrerequisiteDraft}
            />
          )}

          {stepError && <p className="text-sm text-red-500">{stepError}</p>}

          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <SecondaryButton type="button" onClick={handlePrevious}>
                  Back
                </SecondaryButton>
              )}
            </div>
            <div className="flex gap-2">
              {step < 3 && (
                <PrimaryButton type="button" onClick={handleNext}>
                  Next
                </PrimaryButton>
              )}
              {step === 3 && (
                <PrimaryButton type="submit" disabled={processing}>
                  Create Course
                </PrimaryButton>
              )}
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function StepBasics({
  data,
  setData,
  errors,
  branchOptions,
  selectedBranch,
  setSelectedBranch,
  orgUnitOptions,
  deliveryModeOptions,
  statusOptions,
  branchMap,
}) {
  return (
    <div className="space-y-6">
      {branchOptions?.length > 0 && (
        <div>
          <InputLabel htmlFor="course-branch" value="Branch" />
          <select
            id="course-branch"
            value={selectedBranch}
            onChange={(event) => setSelectedBranch(event.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <InputLabel htmlFor="course-org-unit" value="Org Unit" />
        <select
          id="course-org-unit"
          value={data.org_unit_id ?? ''}
          onChange={(event) => setData('org_unit_id', event.target.value)}
          className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          {orgUnitOptions.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.label}
            </option>
          ))}
        </select>
        <InputError className="mt-2" message={errors.org_unit_id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <InputLabel htmlFor="course-code" value="Code" />
          <TextInput
            id="course-code"
            value={data.code}
            onChange={(event) => setData('code', event.target.value.toUpperCase())}
            className="mt-1 block w-full uppercase"
            maxLength={32}
            required
          />
          <InputError className="mt-2" message={errors.code} />
        </div>
        <div>
          <InputLabel htmlFor="course-credit-hours" value="Credit Hours" />
          <TextInput
            id="course-credit-hours"
            type="number"
            min="0"
            max="10"
            value={data.credit_hours}
            onChange={(event) => setData('credit_hours', event.target.value)}
            className="mt-1 block w-full"
          />
          <InputError className="mt-2" message={errors.credit_hours} />
        </div>
      </div>

      <div>
        <InputLabel htmlFor="course-title" value="Title" />
        <TextInput
          id="course-title"
          value={data.title}
          onChange={(event) => setData('title', event.target.value)}
          className="mt-1 block w-full"
          required
        />
        <InputError className="mt-2" message={errors.title} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <InputLabel htmlFor="course-delivery" value="Delivery Mode" />
          <select
            id="course-delivery"
            value={data.delivery_mode}
            onChange={(event) => setData('delivery_mode', event.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {deliveryModeOptions.map((option) => (
              <option key={option} value={option}>
                {capitalize(option)}
              </option>
            ))}
          </select>
          <InputError className="mt-2" message={errors.delivery_mode} />
        </div>
        <div>
          <InputLabel htmlFor="course-status" value="Status" />
          <select
            id="course-status"
            value={data.status}
            onChange={(event) => setData('status', event.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {capitalize(option)}
              </option>
            ))}
          </select>
          <InputError className="mt-2" message={errors.status} />
        </div>
      </div>

      {selectedBranch && branchMap.get(selectedBranch) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Selected branch: {branchMap.get(selectedBranch)?.name} ({branchMap.get(selectedBranch)?.code})
        </p>
      )}
    </div>
  );
}

function StepOutcomes({ outcomes, setOutcomes, draft, setDraft, errors }) {
  const addOutcome = () => {
    if (!draft.outcome_code || !draft.description) {
      return;
    }

    if (outcomes.find((outcome) => outcome.outcome_code.toUpperCase() === draft.outcome_code.toUpperCase())) {
      return;
    }

    setOutcomes([...outcomes, { outcome_code: draft.outcome_code.trim(), description: draft.description.trim() }]);
    setDraft({ outcome_code: '', description: '' });
  };

  const removeOutcome = (code) => {
    setOutcomes(outcomes.filter((outcome) => outcome.outcome_code !== code));
  };

  return (
    <div className="space-y-6">
      <div>
        <InputLabel htmlFor="outcome-code" value="Outcome Code" />
        <div className="mt-1 flex gap-2">
          <TextInput
            id="outcome-code"
            value={draft.outcome_code}
            onChange={(event) => setDraft((prev) => ({ ...prev, outcome_code: event.target.value.toUpperCase() }))}
            className="flex-1"
            maxLength={32}
          />
          <TextInput
            id="outcome-description"
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            className="flex-[2]"
            placeholder="Describe the intended learning outcome"
          />
          <PrimaryButton type="button" onClick={addOutcome}>Add</PrimaryButton>
        </div>
        <InputError className="mt-2" message={errors.outcomes} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        {outcomes.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No outcomes added yet. Define at least one learning outcome.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {outcomes.map((outcome) => (
              <li key={outcome.outcome_code} className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{outcome.outcome_code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{outcome.description}</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase text-red-500 hover:text-red-400"
                  onClick={() => removeOutcome(outcome.outcome_code)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StepPrereqs({ prerequisites, setPrerequisites, courses, draft, setDraft }) {
  const addPrerequisite = () => {
    if (!draft.prereq_course_id) {
      return;
    }

    if (prerequisites.find((item) => Number(item.prereq_course_id) === Number(draft.prereq_course_id))) {
      return;
    }

    setPrerequisites([
      ...prerequisites,
      {
        prereq_course_id: Number(draft.prereq_course_id),
        min_grade: draft.min_grade?.trim() || null,
      },
    ]);
    setDraft({ prereq_course_id: '', min_grade: '' });
  };

  const removePrerequisite = (courseId) => {
    setPrerequisites(prerequisites.filter((item) => Number(item.prereq_course_id) !== Number(courseId)));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <InputLabel htmlFor="prereq-course" value="Select Course" />
          <select
            id="prereq-course"
            value={draft.prereq_course_id}
            onChange={(event) => setDraft((prev) => ({ ...prev, prereq_course_id: event.target.value }))}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <InputLabel htmlFor="prereq-grade" value="Minimum Grade (optional)" />
          <TextInput
            id="prereq-grade"
            value={draft.min_grade}
            onChange={(event) => setDraft((prev) => ({ ...prev, min_grade: event.target.value.toUpperCase() }))}
            className="mt-1 block w-full"
            placeholder="e.g., B, 75%"
            maxLength={8}
          />
        </div>
      </div>
      <PrimaryButton type="button" onClick={addPrerequisite}>
        Add Prerequisite
      </PrimaryButton>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        {prerequisites.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No prerequisites defined. You can always add them later.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {prerequisites.map((prereq) => {
              const course = courses.find((item) => Number(item.id) === Number(prereq.prereq_course_id));
              return (
                <li key={prereq.prereq_course_id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{course?.code ?? prereq.prereq_course_id}</p>
                    <p className="text-gray-600 dark:text-gray-400">{course?.title ?? 'Course removed'}</p>
                    {prereq.min_grade && <p className="text-xs text-gray-500 dark:text-gray-400">Minimum grade: {prereq.min_grade}</p>}
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase text-red-500 hover:text-red-400"
                    onClick={() => removePrerequisite(prereq.prereq_course_id)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function WizardSteps({ current }) {
  const steps = [
    { id: 1, label: 'Basics' },
    { id: 2, label: 'Outcomes' },
    { id: 3, label: 'Prerequisites' },
  ];

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/50">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
              current === step.id
                ? 'bg-indigo-600 text-white'
                : current > step.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {step.id}
          </span>
          <span className={`text-sm font-medium ${current === step.id ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function flattenOrgUnits(tree = [], depth = 0, prefix = '') {
  const options = [];

  tree.forEach((node) => {
    const label = `${prefix}${node.name} (${node.code})`;
    options.push({ id: node.id, label });

    if (node.children?.length) {
      options.push(...flattenOrgUnits(node.children, depth + 1, `${prefix}— `));
    }
  });

  return options;
}

function filterAvailableCourses(courses = [], selectedBranch) {
  if (!selectedBranch) {
    return courses;
  }

  return courses.filter((course) => String(course.branch_id) === String(selectedBranch));
}

function capitalize(value = '') {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
