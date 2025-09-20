import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Index() {
  const { props } = usePage();
  const {
    courses,
    filters,
    statusOptions = [],
    deliveryModeOptions = [],
    branchOptions = [],
    orgUnitFlat = [],
  } = props;

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

  useEffect(() => {
    if (branchId && orgUnitId) {
      const match = visibleOrgUnits.find((option) => option.id === Number(orgUnitId));
      if (!match) {
        setOrgUnitId('');
      }
    }
  }, [branchId]);

  return (
    <AdminLayout title="Courses" header="Courses">
      <Head title="Courses" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Catalog</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage course offerings, outcomes, and prerequisites.</p>
            </div>
            <div className="flex gap-2">
              <Link href={route('admin.courses.create')} className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                New Course
              </Link>
              <SecondaryButton onClick={() => resetFilters()}>Reset Filters</SecondaryButton>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <InputLabel htmlFor="course-search" value="Search" />
              <TextInput
                id="course-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Code or title"
                className="mt-1 block w-full"
              />
            </div>

            {branchOptions?.length > 0 && (
              <div>
                <InputLabel htmlFor="course-branch" value="Branch" />
                <select
                  id="course-branch"
                  value={branchId ?? ''}
                  onChange={(event) => setBranchId(event.target.value || '')}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">All Branches</option>
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
                value={orgUnitId ?? ''}
                onChange={(event) => setOrgUnitId(event.target.value || '')}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Units</option>
                {visibleOrgUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <InputLabel htmlFor="course-status" value="Status" />
              <select
                id="course-status"
                value={status ?? ''}
                onChange={(event) => setStatus(event.target.value || '')}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {capitalize(option)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <InputLabel htmlFor="course-mode" value="Delivery Mode" />
              <select
                id="course-mode"
                value={mode ?? ''}
                onChange={(event) => setMode(event.target.value || '')}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Modes</option>
                {deliveryModeOptions.map((option) => (
                  <option key={option} value={option}>
                    {capitalize(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Courses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{courses.total} total</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <HeaderCell>Code</HeaderCell>
                  <HeaderCell>Title</HeaderCell>
                  <HeaderCell>Branch</HeaderCell>
                  <HeaderCell>Org Unit</HeaderCell>
                  <HeaderCell>Mode</HeaderCell>
                  <HeaderCell>Status</HeaderCell>
                  <HeaderCell className="text-right">Actions</HeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {courses.data?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No courses found.
                    </td>
                  </tr>
                )}

                {courses.data?.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 text-sm font-semibold uppercase text-gray-900 dark:text-gray-100">{course.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{course.branch?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{course.org_unit?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{capitalize(course.delivery_mode)}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={course.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Link
                        href={route('admin.courses.show', course.id)}
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {courses.links?.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
              <span>
                Showing {courses.from ?? 0}–{courses.to ?? 0} of {courses.total}
              </span>
              <div className="flex gap-2">
                {courses.links.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    disabled={!link.url}
                    className={`rounded-lg px-3 py-1 text-sm ${link.active ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );

  function resetFilters() {
    setSearch('');
    setStatus('');
    setMode('');
    setBranchId('');
    setOrgUnitId('');
    router.get(route('admin.courses.index'), {}, { replace: true });
  }
}

function buildOrgUnitOptions(units = [], branches = []) {
  const branchMap = new Map(branches.map((branch) => [branch.id, branch]));
  const unitMap = new Map(units.map((unit) => [unit.id, unit]));
  const depthCache = new Map();

  const computeDepth = (unit) => {
    if (depthCache.has(unit.id)) {
      return depthCache.get(unit.id);
    }
    let depth = 0;
    let current = unit;
    const visited = new Set();

    while (current?.parent_id && unitMap.has(current.parent_id) && !visited.has(current.parent_id)) {
      visited.add(current.parent_id);
      depth += 1;
      current = unitMap.get(current.parent_id);
    }

    depthCache.set(unit.id, depth);
    return depth;
  };

  return units.map((unit) => {
    const depth = computeDepth(unit);
    const branch = branchMap.get(unit.branch_id);
    const prefix = depth > 0 ? `${'— '.repeat(depth)}` : '';
    const label = `${prefix}${unit.name} (${unit.code})${branch ? ` — ${branch.code}` : ''}`;

    return {
      id: unit.id,
      label,
      branch_id: unit.branch_id,
    };
  });
}

function HeaderCell({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    archived: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
      {status ?? 'unknown'}
    </span>
  );
}

function capitalize(value = '') {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
