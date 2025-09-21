import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useAlerts } from '@/Contexts/AlertContext';

function SectionsIndex() {
  const { props } = usePage();
  const { sections, filters = {}, statusOptions = [], termOptions = [], courseOptions = [], branchOptions = [] } = props;
  const { success, error } = useAlerts();

  const [selectedSections, setSelectedSections] = useState([]);
  const [search, setSearch] = useState(filters?.search ?? '');
  const [branchId, setBranchId] = useState(filters?.branch_id ?? '');
  const [termId, setTermId] = useState(filters?.term_id ?? '');
  const [courseId, setCourseId] = useState(filters?.course_id ?? '');
  const [status, setStatus] = useState(filters?.status ?? '');
  const [bulkStatus, setBulkStatus] = useState(statusOptions?.[0] ?? 'planned');

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('admin.sections.index'), {
        search,
        branch_id: branchId || undefined,
        term_id: termId || undefined,
        course_id: courseId || undefined,
        status: status || undefined,
      }, {
        preserveState: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, branchId, termId, courseId, status]);

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedSections(sections?.data?.map((section) => section.id) ?? []);
    } else {
      setSelectedSections([]);
    }
  };

  const toggleSelection = (id) => {
    setSelectedSections((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const handleBulkStatus = () => {
    if (!selectedSections.length) return;

    router.post(route('admin.sections.bulk-status'), {
      section_ids: selectedSections,
      status: bulkStatus,
    }, {
      onSuccess: () => {
        success('Sections updated successfully');
        setSelectedSections([]);
      },
      onError: (errors) => {
        error(Object.values(errors).flat().join('\n') || 'Failed to update sections');
      },
      preserveScroll: true,
    });
  };

  const statusBadges = useMemo(() => ({
    planned: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  }), []);

  return (
    <>
      <Head title="Sections" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sections</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Transform catalog courses into scheduled teaching sections.</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedSections.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
                <SecondaryButton onClick={handleBulkStatus}>Apply</SecondaryButton>
                <DangerButton onClick={() => setSelectedSections([])}>Clear</DangerButton>
              </div>
            )}
            <Link href={route('admin.sections.create')}>
              <PrimaryButton>New Section</PrimaryButton>
            </Link>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <InputLabel htmlFor="sections-search" value="Search" />
              <TextInput
                id="sections-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1 block w-full"
                placeholder="Course code, section code, or title"
              />
            </div>
            <div>
              <InputLabel htmlFor="sections-term" value="Term" />
              <select
                id="sections-term"
                value={termId || ''}
                onChange={(e) => setTermId(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All terms</option>
                {termOptions.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.title || term.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <InputLabel htmlFor="sections-course" value="Course" />
              <select
                id="sections-course"
                value={courseId || ''}
                onChange={(e) => setCourseId(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All courses</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <InputLabel htmlFor="sections-status" value="Status" />
              <select
                id="sections-status"
                value={status || ''}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
            {branchOptions && branchOptions.length > 0 && (
              <div>
                <InputLabel htmlFor="sections-branch" value="Branch" />
                <select
                  id="sections-branch"
                  value={branchId || ''}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">All branches</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={selectedSections.length > 0 && selectedSections.length === (sections?.data?.length ?? 0)}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Meetings</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sections?.data?.length ? sections.data.map((section) => (
                  <tr key={section.id} className="text-gray-900 dark:text-gray-100">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedSections.includes(section.id)}
                        onChange={() => toggleSelection(section.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{section.course?.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{section.course?.title}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{section.section_code}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{section.term?.title || section.term?.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {section.term?.start_date} - {section.term?.end_date}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {section.capacity}
                      <span className="text-xs text-gray-500 dark:text-gray-400"> / Wait {section.waitlist_cap}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{section.meetings_count}</td>
                    <td className="px-4 py-3 text-sm">{section.appointments_count}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadges[section.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300'}`}>
                        {section.status_label || section.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={route('admin.sections.edit', section.id)}>
                          <SecondaryButton>Edit</SecondaryButton>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={9}>No sections found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {sections?.links && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {sections.links.map((link) => (
                <button
                  key={link.label}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                  className={`rounded-lg px-3 py-1 text-sm ${link.active ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                  disabled={!link.url}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Index() {
  return (
    <AdminLayout title="Sections" header="Sections">
      <SectionsIndex />
    </AdminLayout>
  );
}
