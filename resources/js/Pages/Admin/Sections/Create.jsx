import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useAlerts } from '@/Contexts/AlertContext';

function CreateSection() {
  const { props } = usePage();
  const { courseOptions = [], termOptions = [], statusOptions = [] } = props;
  const { success, error } = useAlerts();

  const form = useForm({
    course_id: '',
    term_id: '',
    section_code: '',
    capacity: 30,
    waitlist_cap: 0,
    status: statusOptions?.[0] ?? 'planned',
    notes: '',
  });

  const submit = (e) => {
    e.preventDefault();
    form.post(route('admin.sections.store'), {
      preserveScroll: true,
      onSuccess: () => {
        success('Section created successfully');
      },
      onError: (errors) => {
        error(Object.values(errors).flat().join('\n') || 'Failed to create section');
      },
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create Section</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select a course and term, then configure the section details.</p>
        </div>
        <SecondaryButton asChild>
          <Link href={route('admin.sections.index')}>Back to Sections</Link>
        </SecondaryButton>
      </div>

      <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-1">
          <InputLabel htmlFor="course" value="Course" />
          <select
            id="course"
            value={form.data.course_id}
            onChange={(e) => form.setData('course_id', e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            required
          >
            <option value="" disabled>Select course</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
          <InputError message={form.errors.course_id} className="mt-2" />
        </div>

        <div className="md:col-span-1">
          <InputLabel htmlFor="term" value="Term" />
          <select
            id="term"
            value={form.data.term_id}
            onChange={(e) => form.setData('term_id', e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            required
          >
            <option value="" disabled>Select term</option>
            {termOptions.map((term) => (
              <option key={term.id} value={term.id}>
                {term.title || term.code}
              </option>
            ))}
          </select>
          <InputError message={form.errors.term_id} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="section_code" value="Section Code" />
          <TextInput
            id="section_code"
            value={form.data.section_code}
            onChange={(e) => form.setData('section_code', e.target.value)}
            className="mt-1 block w-full"
            placeholder="e.g. A"
            required
          />
          <InputError message={form.errors.section_code} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="status" value="Status" />
          <select
            id="status"
            value={form.data.status}
            onChange={(e) => form.setData('status', e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
          <InputError message={form.errors.status} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="capacity" value="Capacity" />
          <TextInput
            id="capacity"
            type="number"
            min="0"
            value={form.data.capacity}
            onChange={(e) => form.setData('capacity', e.target.value)}
            className="mt-1 block w-full"
            required
          />
          <InputError message={form.errors.capacity} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="waitlist_cap" value="Waitlist Capacity" />
          <TextInput
            id="waitlist_cap"
            type="number"
            min="0"
            value={form.data.waitlist_cap}
            onChange={(e) => form.setData('waitlist_cap', e.target.value)}
            className="mt-1 block w-full"
          />
          <InputError message={form.errors.waitlist_cap} className="mt-2" />
        </div>

        <div className="md:col-span-2">
          <InputLabel htmlFor="notes" value="Notes" />
          <textarea
            id="notes"
            value={form.data.notes}
            onChange={(e) => form.setData('notes', e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            rows={4}
            placeholder="Additional details, scheduling considerations, etc."
          />
          <InputError message={form.errors.notes} className="mt-2" />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <SecondaryButton asChild>
            <Link href={route('admin.sections.index')}>Cancel</Link>
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={form.processing}>Create Section</PrimaryButton>
        </div>
      </form>
    </div>
  );
}

export default function Create() {
  return (
    <AdminLayout title="Create Section" header="Create Section">
      <Head title="Create Section" />
      <CreateSection />
    </AdminLayout>
  );
}
