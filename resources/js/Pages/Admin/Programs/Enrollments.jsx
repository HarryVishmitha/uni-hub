import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';
import DangerButton from '@/Components/DangerButton.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import TextInput from '@/Components/TextInput.jsx';
import Modal from '@/Components/Modal.jsx';
import { useAlerts } from '@/Contexts/AlertContext';
import { confirmAction } from '@/Utils/AlertUtils';

function StatusBadge({ status }) {
    const palette = {
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        paused: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        graduated: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
        withdrawn: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${palette[status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300'}`}>
            {status}
        </span>
    );
}

function EditEnrollmentModal({ enrollment, isOpen, onClose, onSave, statusOptions, termOptions, saving }) {
    const [cohort, setCohort] = useState('');
    const [status, setStatus] = useState(statusOptions?.[0] ?? 'active');
    const [startTermId, setStartTermId] = useState('');

    useEffect(() => {
        if (enrollment) {
            setCohort(enrollment.cohort ?? '');
            setStatus(enrollment.status ?? statusOptions?.[0] ?? 'active');
            setStartTermId(enrollment.start_term?.id ? String(enrollment.start_term.id) : '');
        }
    }, [enrollment, statusOptions]);

    const handleSubmit = () => {
        onSave({
            cohort: cohort || null,
            status,
            start_term_id: startTermId || null,
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Update Enrollment</h3>
                <div className="mt-4 space-y-4">
                    <div>
                        <InputLabel htmlFor="edit-cohort" value="Cohort" />
                        <TextInput id="edit-cohort" className="mt-1 block w-full" value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="e.g. Fall 2025 Cohort" />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-status" value="Status" />
                        <select
                            id="edit-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            {statusOptions?.map((option) => (
                                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-term" value="Start Term" />
                        <select
                            id="edit-term"
                            value={startTermId || ''}
                            onChange={(e) => setStartTermId(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">Not specified</option>
                            {termOptions?.map((term) => (
                                <option key={term.id} value={term.id}>{term.title || term.code}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

function ProgramEnrollments() {
    const { props } = usePage();
    const { program, enrollments, cohortOptions = [], statusOptions = [], statusCounts = {}, termOptions = [], studentOptions = [], filters = {} } = props;
    const { success, error } = useAlerts();

    const [search, setSearch] = useState(filters.search ?? '');
    const [cohortFilter, setCohortFilter] = useState(filters.cohort ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [bulkStatus, setBulkStatus] = useState(statusOptions?.[0] ?? 'active');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const addForm = useForm({
        student_ids: [],
        cohort: '',
        start_term_id: '',
        status: statusOptions?.[0] ?? 'active',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('admin.programs.enrollments.index', program.id), {
                search: search || undefined,
                cohort: cohortFilter || undefined,
                status: statusFilter || undefined,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, cohortFilter, statusFilter]);

    const toggleSelection = (id) => {
        setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    };

    const toggleAll = (checked) => {
        if (!enrollments?.data) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(checked ? enrollments.data.map((item) => item.id) : []);
    };

    const submitAdd = () => {
        if (!addForm.data.student_ids.length) {
            error('Select at least one student to enroll.');
            return;
        }

        setIsSubmitting(true);
        addForm.clearErrors();

        window.axios.post(route('admin.programs.enrollments.store', program.id), addForm.data)
            .then(() => {
                success('Students enrolled successfully.');
                addForm.reset('student_ids', 'cohort', 'start_term_id');
                addForm.setData('status', statusOptions?.[0] ?? 'active');
                setSelectedIds([]);
                router.reload({ only: ['enrollments'] });
            })
            .catch((err) => {
                if (err.response?.status === 422 && err.response.data?.errors) {
                    Object.entries(err.response.data.errors).forEach(([field, messages]) => {
                        addForm.setError(field, Array.isArray(messages) ? messages.join(' ') : messages);
                    });
                }
                error(err.response?.data?.message || 'Failed to enroll students. Please review the errors and try again.');
            })
            .finally(() => setIsSubmitting(false));
    };

    const openEdit = (enrollment) => {
        setEditing(enrollment);
        setIsEditOpen(true);
    };

    const saveEdit = (payload) => {
        if (!editing) return;

        setIsSavingEdit(true);

        window.axios.patch(route('admin.programs.enrollments.update', editing.id), payload)
            .then(() => {
                success('Enrollment updated.');
                setIsEditOpen(false);
                setEditing(null);
                router.reload({ only: ['enrollments'] });
            })
            .catch(() => error('Failed to update enrollment.'))
            .finally(() => setIsSavingEdit(false));
    };

    const handleDelete = (enrollment) => {
        confirmAction({
            message: `Remove ${enrollment.student?.name ?? 'this student'} from ${program.title}?`,
            action: () => {
                window.axios.delete(route('admin.programs.enrollments.destroy', { program: program.id, program_enrollment: enrollment.id }))
                    .then(() => {
                        success('Enrollment removed.');
                        setSelectedIds((current) => current.filter((id) => id !== enrollment.id));
                        router.reload({ only: ['enrollments'] });
                    })
                    .catch(() => error('Failed to remove enrollment.'));
            },
        });
    };

    const applyBulkStatus = () => {
        if (!selectedIds.length) {
            error('Select at least one enrollment to update.');
            return;
        }

        Promise.all(selectedIds.map((id) => window.axios.patch(route('admin.programs.enrollments.update', id), { status: bulkStatus })))
            .then(() => {
                success('Status updated.');
                setSelectedIds([]);
                router.reload({ only: ['enrollments'] });
            })
            .catch(() => error('Failed to update one or more enrollments.'));
    };

    const studentOptionsForSelect = useMemo(() => studentOptions?.map((student) => ({ value: student.id, label: `${student.name} (${student.email})` })) ?? [], [studentOptions]);

    return (
        <>
            <Head title={`Program Enrollments — ${program.title}`} />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{program.title} — Enrollments</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage cohorts, statuses, and program assignments.</p>
                    </div>
                    <div className="flex items-center gap-3">
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
                            <SecondaryButton onClick={applyBulkStatus}>Set Status</SecondaryButton>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5">
                    <div className="mb-6 grid gap-4 lg:grid-cols-4">
                        <div>
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Student name or email"
                                className="mt-1 block w-full"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="cohort" value="Cohort" />
                            <select
                                id="cohort"
                                value={cohortFilter}
                                onChange={(e) => setCohortFilter(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">All cohorts</option>
                                {cohortOptions.map((cohort) => (
                                    <option key={cohort} value={cohort}>{cohort}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">All statuses</option>
                                {statusOptions.map((option) => (
                                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                                <div className="font-semibold">Status Snapshot</div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {statusOptions.map((option) => (
                                        <div key={option} className="flex items-center justify-between">
                                            <span className="capitalize">{option}</span>
                                            <span className="font-semibold">{statusCounts[option] ?? 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Add Students</h3>
                        <div className="mt-3 grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="add-student" value="Select Students" />
                                <select
                                    id="add-student"
                                    multiple
                                    value={addForm.data.student_ids.map(String)}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, (option) => option.value);
                                        addForm.setData('student_ids', values.map(Number));
                                    }}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    size={Math.min(6, studentOptionsForSelect.length || 4)}
                                >
                                    {studentOptionsForSelect.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {!studentOptionsForSelect.length && (
                                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                                        No students found for this branch. Add students or assign them the student role to enroll them.
                                    </p>
                                )}
                            </div>
                            <div>
                                <InputLabel htmlFor="add-cohort" value="Cohort" />
                                <TextInput
                                    id="add-cohort"
                                    value={addForm.data.cohort || ''}
                                    onChange={(e) => addForm.setData('cohort', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Optional cohort label"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="add-term" value="Start Term" />
                                <select
                                    id="add-term"
                                    value={addForm.data.start_term_id || ''}
                                    onChange={(e) => addForm.setData('start_term_id', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Not specified</option>
                                    {termOptions.map((term) => (
                                        <option key={term.id} value={term.id}>{term.title || term.code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div>
                                <InputLabel htmlFor="add-status" value="Status" />
                                <select
                                    id="add-status"
                                    value={addForm.data.status}
                                    onChange={(e) => addForm.setData('status', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <PrimaryButton onClick={submitAdd} disabled={isSubmitting}>
                                {isSubmitting ? 'Enrolling…' : 'Enroll Selected'}
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-900/70">
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    <th className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={selectedIds.length > 0 && selectedIds.length === (enrollments?.data?.length ?? 0)}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Cohort</th>
                                    <th className="px-4 py-3">Start Term</th>
                                    <th className="px-4 py-3">Updated</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                {enrollments?.data?.length ? (
                                    enrollments.data.map((enrollment) => (
                                        <tr key={enrollment.id}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedIds.includes(enrollment.id)}
                                                    onChange={() => toggleSelection(enrollment.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                <div className="font-medium">{enrollment.student?.name ?? 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{enrollment.student?.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <StatusBadge status={enrollment.status} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{enrollment.cohort || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{enrollment.start_term?.title || enrollment.start_term?.code || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{enrollment.updated_at ? new Date(enrollment.updated_at).toLocaleString() : '—'}</td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <div className="flex justify-end gap-2">
                                                    <SecondaryButton onClick={() => openEdit(enrollment)}>Edit</SecondaryButton>
                                                    <DangerButton onClick={() => handleDelete(enrollment)}>Remove</DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No enrollments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            Showing page {enrollments?.current_page ?? 1} of {enrollments?.last_page ?? 1}
                        </div>
                        <div className="flex gap-2">
                            {enrollments?.links?.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={link.url === null}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                    className={`rounded-lg px-3 py-1 ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} disabled:cursor-not-allowed disabled:opacity-40`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <EditEnrollmentModal
                enrollment={editing}
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    setEditing(null);
                }}
                onSave={saveEdit}
                statusOptions={statusOptions}
                termOptions={termOptions}
                saving={isSavingEdit}
            />
        </>
    );
}

export default function ProgramEnrollmentsPage() {
    const { props } = usePage();
    const title = props?.program?.title ? `Program Enrollments — ${props.program.title}` : 'Program Enrollments';

    return (
        <AdminLayout title={title} header="Program Enrollments">
            <ProgramEnrollments />
        </AdminLayout>
    );
}
