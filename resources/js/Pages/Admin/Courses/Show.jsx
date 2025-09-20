import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Show() {
  const { props } = usePage();
  const { course, statusOptions = [], deliveryModeOptions = [], availablePrerequisites = [] } = props;
  const [tab, setTab] = useState('overview');

  const outcomeForm = useForm({
    outcome_code: '',
    description: '',
  });

  const prereqForm = useForm({
    prereq_course_id: '',
    min_grade: '',
  });

  const remainingPrerequisites = useMemo(() => availablePrerequisites.filter((candidate) => !course.prerequisites.find((prereq) => Number(prereq.id) === Number(candidate.id))), [availablePrerequisites, course.prerequisites]);

  const addOutcome = (event) => {
    event.preventDefault();
    outcomeForm.post(route('admin.courses.outcomes.store', course.id), {
      preserveScroll: true,
      onSuccess: () => outcomeForm.reset(),
    });
  };

  const removeOutcome = (outcomeId) => {
    router.delete(route('admin.courses.outcomes.destroy', [course.id, outcomeId]), {
      preserveScroll: true,
    });
  };

  const addPrerequisite = (event) => {
    event.preventDefault();
    prereqForm.post(route('admin.courses.prerequisites.store', course.id), {
      preserveScroll: true,
      onSuccess: () => prereqForm.reset(),
    });
  };

  const removePrerequisite = (id) => {
    router.delete(route('admin.courses.prerequisites.destroy', [course.id, id]), {
      preserveScroll: true,
    });
  };

  return (
    <AdminLayout title={course.title} header={course.title}>
      <Head title={course.title} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Course Code</p>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{course.code}</h2>
          </div>
          <div className="flex gap-2">
            <Link
              href={route('admin.courses.edit', course.id)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              Edit Course
            </Link>
            <SecondaryButton type="button" onClick={() => router.visit(route('admin.courses.index'))}>
              Back to Catalog
            </SecondaryButton>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex gap-2">
            <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>Overview</TabButton>
            <TabButton active={tab === 'outcomes'} onClick={() => setTab('outcomes')}>Outcomes</TabButton>
            <TabButton active={tab === 'prereqs'} onClick={() => setTab('prereqs')}>Prerequisites</TabButton>
          </div>
        </div>

        {tab === 'overview' && <OverviewTab course={course} statusOptions={statusOptions} deliveryModeOptions={deliveryModeOptions} />}
        {tab === 'outcomes' && (
          <OutcomesTab
            course={course}
            outcomeForm={outcomeForm}
            addOutcome={addOutcome}
            removeOutcome={removeOutcome}
          />
        )}
        {tab === 'prereqs' && (
          <PrerequisitesTab
            course={course}
            prereqForm={prereqForm}
            addPrerequisite={addPrerequisite}
            removePrerequisite={removePrerequisite}
            options={remainingPrerequisites}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function OverviewTab({ course, statusOptions, deliveryModeOptions }) {
  return (
    <div className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 md:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Details</h3>
        <Detail label="Title" value={course.title} />
        <Detail label="Credit Hours" value={course.credit_hours} />
        <Detail label="Status" value={capitalize(course.status)} badge />
        <Detail label="Delivery Mode" value={capitalize(course.delivery_mode)} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Context</h3>
        <Detail label="Branch" value={course.branch?.name ?? '—'} />
        <Detail label="Org Unit" value={course.org_unit?.name ?? '—'} />
        <Detail label="Last Updated" value={course.updated_at ? new Date(course.updated_at).toLocaleString() : '—'} />
      </div>
    </div>
  );
}

function OutcomesTab({ course, outcomeForm, addOutcome, removeOutcome }) {
  return (
    <div className="space-y-6">
      <form onSubmit={addOutcome} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Outcome</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Capture the measurable learning objectives for this course.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <InputLabel htmlFor="new-outcome-code" value="Outcome Code" />
            <TextInput
              id="new-outcome-code"
              value={outcomeForm.data.outcome_code}
              onChange={(event) => outcomeForm.setData('outcome_code', event.target.value.toUpperCase())}
              className="mt-1 block w-full uppercase"
              maxLength={32}
              required
            />
            <InputError className="mt-2" message={outcomeForm.errors.outcome_code} />
          </div>
          <div>
            <InputLabel htmlFor="new-outcome-description" value="Description" />
            <TextInput
              id="new-outcome-description"
              value={outcomeForm.data.description}
              onChange={(event) => outcomeForm.setData('description', event.target.value)}
              className="mt-1 block w-full"
              placeholder="Students will be able to..."
              required
            />
            <InputError className="mt-2" message={outcomeForm.errors.description} />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <PrimaryButton type="submit" disabled={outcomeForm.processing}>
            Add Outcome
          </PrimaryButton>
        </div>
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Existing Outcomes</h3>
        </div>
        {course.outcomes.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500 dark:text-gray-400">No outcomes recorded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {course.outcomes.map((outcome) => (
              <li key={outcome.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{outcome.outcome_code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{outcome.description}</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase text-red-500 hover:text-red-400"
                  onClick={() => removeOutcome(outcome.id)}
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

function PrerequisitesTab({ course, prereqForm, addPrerequisite, removePrerequisite, options }) {
  return (
    <div className="space-y-6">
      <form onSubmit={addPrerequisite} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Prerequisite</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Specify course requirements that must be completed beforehand.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <InputLabel htmlFor="new-prereq-course" value="Course" />
            <select
              id="new-prereq-course"
              value={prereqForm.data.prereq_course_id}
              onChange={(event) => prereqForm.setData('prereq_course_id', event.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Select a course</option>
              {options.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </select>
            <InputError className="mt-2" message={prereqForm.errors.prereq_course_id} />
          </div>
          <div>
            <InputLabel htmlFor="new-prereq-grade" value="Minimum Grade" />
            <TextInput
              id="new-prereq-grade"
              value={prereqForm.data.min_grade}
              onChange={(event) => prereqForm.setData('min_grade', event.target.value.toUpperCase())}
              className="mt-1 block w-full"
              placeholder="Optional"
              maxLength={8}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <PrimaryButton type="submit" disabled={prereqForm.processing}>
            Add Prerequisite
          </PrimaryButton>
        </div>
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Current Prerequisites</h3>
        </div>
        {course.prerequisites.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500 dark:text-gray-400">No prerequisites configured for this course.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {course.prerequisites.map((prereq) => (
              <li key={prereq.id} className="flex items-center justify-between px-6 py-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{prereq.code}</p>
                  <p className="text-gray-600 dark:text-gray-400">{prereq.title}</p>
                  {prereq.min_grade && <p className="text-xs text-gray-500 dark:text-gray-400">Minimum grade: {prereq.min_grade}</p>}
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase text-red-500 hover:text-red-400"
                  onClick={() => removePrerequisite(prereq.id)}
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

function Detail({ label, value, badge = false }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      {badge ? (
        <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {value}
        </span>
      ) : (
        <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{value ?? '—'}</p>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function capitalize(value = '') {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
