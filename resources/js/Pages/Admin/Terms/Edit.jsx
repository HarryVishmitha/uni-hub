import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useAlerts } from '@/Contexts/AlertContext';

// Inner component that uses AlertProvider from AdminLayout
function TermsEdit() {
  const { props } = usePage();
  const { term, statusOptions = [], branchOptions = [] } = props;
  const isEdit = Boolean(term);
  const { success, error } = useAlerts();

  const { data, setData, post, put, processing, errors, reset } = useForm({
    branch_id: term?.branch_id ?? branchOptions?.[0]?.id ?? '',
    title: term?.title ?? '',
    code: term?.code ?? '',
    status: term?.status ?? statusOptions[0] ?? 'planned',
    start_date: term?.start_date ?? '',
    end_date: term?.end_date ?? '',
    add_drop_start: term?.add_drop_start ?? '',
    add_drop_end: term?.add_drop_end ?? '',
    description: term?.description ?? '',
  });

  const submit = (event) => {
    event.preventDefault();

    if (isEdit) {
      put(route('admin.terms.update', term.id), {
        onSuccess: () => {
          success(`Term "${data.title}" updated successfully`);
        },
        onError: (errors) => {
          error(Object.values(errors).flat().join('\n') || 'Failed to update term');
        }
      });
    } else {
      post(route('admin.terms.store'), {
        onSuccess: () => {
          success(`Term "${data.title}" created successfully`);
        },
        onError: (errors) => {
          error(Object.values(errors).flat().join('\n') || 'Failed to create term');
        }
      });
    }
  };

  return (
    <>
      <Head title={isEdit ? 'Edit Term' : 'Create Term'} />

      <div className="mx-auto max-w-3xl">
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isEdit ? 'Update Term Details' : 'Add a New Term'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide the scheduling information and status for this academic term.
              </p>
            </div>
            <Link
              href={route('admin.terms.index')}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              Back to List
            </Link>
          </div>

          {branchOptions?.length > 0 && (
            <div>
              <InputLabel htmlFor="term-branch" value="Branch" />
              <select
                id="term-branch"
                value={data.branch_id ?? ''}
                onChange={(event) => setData('branch_id', event.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                {branchOptions.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
              <InputError className="mt-2" message={errors.branch_id} />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputLabel htmlFor="term-title" value="Title" />
              <TextInput
                id="term-title"
                value={data.title}
                onChange={(event) => setData('title', event.target.value)}
                className="mt-1 block w-full"
                required
              />
              <InputError className="mt-2" message={errors.title} />
            </div>
            <div>
              <InputLabel htmlFor="term-code" value="Code" />
              <TextInput
                id="term-code"
                value={data.code ?? ''}
                onChange={(event) => setData('code', event.target.value)}
                className="mt-1 block w-full"
              />
              <InputError className="mt-2" message={errors.code} />
            </div>
          </div>

          <div>
            <InputLabel htmlFor="term-status" value="Status" />
            <select
              id="term-status"
              value={data.status}
              onChange={(event) => setData('status', event.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <InputError className="mt-2" message={errors.status} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputLabel htmlFor="term-start" value="Start Date" />
              <TextInput
                type="date"
                id="term-start"
                value={data.start_date ?? ''}
                onChange={(event) => setData('start_date', event.target.value)}
                className="mt-1 block w-full"
                required
              />
              <InputError className="mt-2" message={errors.start_date} />
            </div>
            <div>
              <InputLabel htmlFor="term-end" value="End Date" />
              <TextInput
                type="date"
                id="term-end"
                value={data.end_date ?? ''}
                onChange={(event) => setData('end_date', event.target.value)}
                className="mt-1 block w-full"
                required
              />
              <InputError className="mt-2" message={errors.end_date} />
            </div>
            <div>
              <InputLabel htmlFor="term-add-drop-start" value="Add/Drop Start" />
              <TextInput
                type="date"
                id="term-add-drop-start"
                value={data.add_drop_start ?? ''}
                onChange={(event) => setData('add_drop_start', event.target.value)}
                className="mt-1 block w-full"
              />
              <InputError className="mt-2" message={errors.add_drop_start} />
            </div>
            <div>
              <InputLabel htmlFor="term-add-drop-end" value="Add/Drop End" />
              <TextInput
                type="date"
                id="term-add-drop-end"
                value={data.add_drop_end ?? ''}
                onChange={(event) => setData('add_drop_end', event.target.value)}
                className="mt-1 block w-full"
              />
              <InputError className="mt-2" message={errors.add_drop_end} />
            </div>
          </div>

          <div>
            <InputLabel htmlFor="term-description" value="Description (Optional)" />
            <textarea
              id="term-description"
              value={data.description ?? ''}
              onChange={(event) => setData('description', event.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              rows={3}
            />
            <InputError className="mt-2" message={errors.description} />
          </div>

          <div className="flex justify-end gap-2">
            <SecondaryButton type="button" onClick={() => reset()}>
              Reset
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={processing}>
              {isEdit ? 'Save Changes' : 'Create Term'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </>
  );
}

// Wrap the component with AdminLayout which provides AlertProvider
export default function Edit() {
  return (
    <AdminLayout
      title="Edit Term"
      header="Edit Term"
    >
      <TermsEdit />
    </AdminLayout>
  );
}