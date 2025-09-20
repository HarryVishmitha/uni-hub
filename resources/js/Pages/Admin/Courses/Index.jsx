import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useAlerts } from '@/Contexts/AlertContext';
import { confirmAction } from '@/Utils/AlertUtils';

// Inner component that uses AlertProvider from AdminLayout
function CoursesIndex() {
  const { props } = usePage();
  const {
    courses,
    filters,
    statusOptions = [],
    deliveryModeOptions = [],
    branchOptions = [],
    orgUnitFlat = [],
  } = props;
  const { success, error, info } = useAlerts();

  const [search, setSearch] = useState(filters?.search ?? '');
  const [status, setStatus] = useState(filters?.status ?? '');
  const [mode, setMode] = useState(filters?.delivery_mode ?? '');
  const [branchId, setBranchId] = useState(filters?.branch_id ?? '');
  const [orgUnitId, setOrgUnitId] = useState(filters?.org_unit_id ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.get(route('admin.courses.index'), filterPayload(), {
        preserveState: true,
        replace: true,
      });
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, mode, branchId, orgUnitId]);

  const filterPayload = () => ({
    search: search || undefined,
    status: status || undefined,
    delivery_mode: mode || undefined,
    branch_id: branchId || undefined,
    org_unit_id: orgUnitId || undefined,
  });

  const orgUnitOptions = useMemo(() => buildOrgUnitOptions(orgUnitFlat, branchOptions), [orgUnitFlat, branchOptions]);

  const visibleOrgUnits = branchId ? orgUnitOptions.filter((option) => option.branch_id === Number(branchId)) : orgUnitOptions;

  return (
    <>
      <Head title="Courses" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Catalog</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse all courses offered across all branches and departments.
            </p>
          </div>
          <Link
            href={route('admin.courses.create')}
            className="inline-flex items-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            New Course
          </Link>
        </div>

        <div className="px-6 py-4">
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <InputLabel htmlFor="course-search" value="Search" />
              <TextInput
                id="course-search"
                className="mt-1 block w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, code, or description"
              />
            </div>

            <div>
              <InputLabel htmlFor="filter-status" value="Status" />
              <select
                id="filter-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <InputLabel htmlFor="filter-mode" value="Delivery Mode" />
              <select
                id="filter-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Modes</option>
                {deliveryModeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <InputLabel htmlFor="filter-branch" value="Branch" />
              <select
                id="filter-branch"
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setOrgUnitId('');
                }}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <InputLabel htmlFor="filter-orgunit" value="Department" />
              <select
                id="filter-orgunit"
                value={orgUnitId}
                onChange={(e) => setOrgUnitId(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Departments</option>
                {visibleOrgUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Credits
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {courses.data.length > 0 ? (
                    courses.data.map((course) => (
                      <tr key={course.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{course.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {course.code} &middot; {course.delivery_mode}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {course.credit_hours}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {course.org_unit?.name || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {course.branch?.name || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              course.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={route('admin.courses.edit', course.id)}
                              className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Edit
                            </Link>
                            <SecondaryButton onClick={() => handleDeleteClick(course)}>Delete</SecondaryButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                        colSpan={6}
                      >
                        No courses found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {courses.links && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {courses.links.map((link) => (
                <button
                  key={link.label}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                  className={`rounded-lg px-3 py-1 text-sm ${
                    link.active
                      ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  disabled={!link.url}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  function handleDeleteClick(course) {
    confirmAction({
      title: 'Delete Course',
      message: `Are you sure you want to delete the course "${course.title}"?`,
      action: () =>
        router.delete(route('admin.courses.destroy', course.id), {
          onSuccess: () => {
            success(`Course "${course.title}" was deleted successfully`);
          },
          onError: (errors) => {
            error(errors?.message || 'An error occurred while deleting the course');
          },
        }),
    });
  }
}

function buildOrgUnitOptions(orgUnitFlat, branchOptions) {
  return orgUnitFlat.map((unit) => {
    const branch = branchOptions.find((b) => b.id === unit.branch_id);
    return {
      ...unit,
      name: `${unit.name} ${branch ? `(${branch.code})` : ''}`,
    };
  });
}

// Wrap the component with AdminLayout which provides AlertProvider
export default function Index() {
  return (
    <AdminLayout title="Courses" header="Courses">
      <CoursesIndex />
    </AdminLayout>
  );
}