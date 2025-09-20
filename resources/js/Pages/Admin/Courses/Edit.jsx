import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Edit() {
  const { props } = usePage();
  const { course, statusOptions = [], deliveryModeOptions = [], branchOptions = [], orgUnitTree = {} } = props;
  const initialBranch = course.branch_id ?? branchOptions?.[0]?.id ?? Object.keys(orgUnitTree)[0] ?? '';
  const [selectedBranch, setSelectedBranch] = useState(String(initialBranch));

  const orgUnitOptions = useMemo(() => flattenOrgUnits(orgUnitTree[selectedBranch] ?? []), [selectedBranch, orgUnitTree]);

  const { data, setData, put, processing, errors } = useForm({
    org_unit_id: course.org_unit_id ?? orgUnitOptions[0]?.id ?? '',
    code: course.code ?? '',
    title: course.title ?? '',
    credit_hours: course.credit_hours ?? 0,
    delivery_mode: course.delivery_mode ?? deliveryModeOptions[0] ?? 'onsite',
    status: course.status ?? statusOptions[0] ?? 'draft',
  });

  const submit = (event) => {
    event.preventDefault();
    put(route('admin.courses.update', course.id));
  };

  return (
    <AdminLayout title={`Edit ${course.title}`} header={`Edit ${course.title}`}>
      <Head title={`Edit ${course.title}`} />

      <div className="mx-auto max-w-4xl">
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Details</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update the foundational information for this course.</p>
            </div>
            <SecondaryButton type="button" onClick={() => window.history.back()}>
              Cancel
            </SecondaryButton>
          </div>

          {branchOptions?.length > 0 && (
            <div>
              <InputLabel htmlFor="edit-course-branch" value="Branch" />
              <select
                id="edit-course-branch"
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
            <InputLabel htmlFor="edit-course-org-unit" value="Org Unit" />
            <select
              id="edit-course-org-unit"
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
              <InputLabel htmlFor="edit-course-code" value="Code" />
              <TextInput
                id="edit-course-code"
                value={data.code}
                onChange={(event) => setData('code', event.target.value.toUpperCase())}
                className="mt-1 block w-full uppercase"
                maxLength={32}
                required
              />
              <InputError className="mt-2" message={errors.code} />
            </div>
            <div>
              <InputLabel htmlFor="edit-course-credits" value="Credit Hours" />
              <TextInput
                id="edit-course-credits"
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
            <InputLabel htmlFor="edit-course-title" value="Title" />
            <TextInput
              id="edit-course-title"
              value={data.title}
              onChange={(event) => setData('title', event.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError className="mt-2" message={errors.title} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputLabel htmlFor="edit-course-mode" value="Delivery Mode" />
              <select
                id="edit-course-mode"
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
              <InputLabel htmlFor="edit-course-status" value="Status" />
              <select
                id="edit-course-status"
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

          <div className="flex justify-end gap-2">
            <SecondaryButton type="button" onClick={() => window.history.back()}>
              Back
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={processing}>
              Save Changes
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function flattenOrgUnits(tree = [], prefix = '') {
  const options = [];

  tree.forEach((node) => {
    const label = `${prefix}${node.name} (${node.code})`;
    options.push({ id: node.id, label });
    if (node.children?.length) {
      options.push(...flattenOrgUnits(node.children, `${prefix}— `));
    }
  });

  return options;
}

function capitalize(value = '') {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
