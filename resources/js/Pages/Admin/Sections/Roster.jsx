import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';
import DangerButton from '@/Components/DangerButton.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import TextInput from '@/Components/TextInput.jsx';
import Checkbox from '@/Components/Checkbox.jsx';
import Modal from '@/Components/Modal.jsx';
import { useAlerts } from '@/Contexts/AlertContext';
import { confirmAction } from '@/Utils/AlertUtils';

function StatusPill({ status }) {
    const palette = {
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        waitlisted: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        dropped: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
        completed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
        failed: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${palette[status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300'}`}>
            {status}
        </span>
    );
}

function ConflictList({ conflicts }) {
    if (!conflicts?.length) return null;

    return (
        <div className="mt-2 space-y-1 text-xs text-rose-600 dark:text-rose-300">
            {conflicts.map((conflict) => (
                <div key={`${conflict.section_id}-${conflict.start_time}`}>Conflicts with {conflict.course_code} ({conflict.section_code}) on {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][conflict.day_of_week]} at {conflict.start_time}</div>
            ))}
        </div>
    );
}

function BulkCompleteModal({ open, onClose, onSubmit, selected }) {
    const [status, setStatus] = useState('completed');

    useEffect(() => {
        if (!open) {
            setStatus('completed');
        }
    }, [open]);

    return (
        <Modal show={open} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Set Status for {selected.length} students</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Mark selected enrollments as completed or failed.</p>
                <div className="mt-4">
                    <InputLabel htmlFor="bulk-status" value="Status" />
                    <select
                        id="bulk-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={() => onSubmit(status)}>Apply</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

function RosterPage() {
    const { props } = usePage();
    const { section, statusOptions = [], roleOptions = [], programOptions = [], termOptions = [], studentOptions = [], routes = {} } = props;
    const { success, error } = useAlerts();

    const [roster, setRoster] = useState({ data: [], next_cursor: null, prev_cursor: null });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const enrollForm = useForm({
        student_id: '',
        role: 'student',
        override: false,
        override_reason: '',
        force_waitlist: false,
        bypass_prerequisites: false,
    });

    const bulkForm = useForm({
        program_id: programOptions?.[0]?.id ?? '',
        term_id: termOptions?.[0]?.id ?? section?.term?.id ?? '',
        cohort: '',
        override: false,
        override_reason: '',
        force_waitlist: false,
        student_list: '',
    });

    const loadRoster = useCallback((nextCursor = null) => {
        setLoading(true);
        const params = {
            status: statusFilter || undefined,
            role: roleFilter || undefined,
            search: search || undefined,
            cursor: nextCursor || undefined,
        };

        window.axios.get(routes.roster, { params })
            .then((response) => {
                setRoster(response.data);
                setCursor(nextCursor);
            })
            .catch(() => error('Failed to load roster data.'))
            .finally(() => setLoading(false));
    }, [routes.roster, statusFilter, roleFilter, search, error]);

    useEffect(() => {
        loadRoster();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadRoster();
        }, 250);

        return () => clearTimeout(timeout);
    }, [statusFilter, roleFilter, search]);

    const toggleSelection = (id) => {
        setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    };

    const toggleAll = (checked) => {
        if (!roster.data) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(checked ? roster.data.map((row) => row.id) : []);
    };

    const submitEnroll = () => {
        if (!enrollForm.data.student_id) {
            error('Select a student to enroll.');
            return;
        }

        enrollForm.post(routes.enroll, {
            preserveScroll: true,
            onSuccess: () => {
                success('Enrollment created.');
                enrollForm.reset('student_id', 'override', 'override_reason', 'force_waitlist', 'bypass_prerequisites');
                enrollForm.setData('role', 'student');
                loadRoster(cursor);
            },
            onError: () => error('Failed to enroll student.'),
        });
    };

    const submitBulkEnroll = () => {
        if (!bulkForm.data.program_id || !bulkForm.data.term_id) {
            error('Select a program and term for bulk enrollment.');
            return;
        }

        const studentIds = bulkForm.data.student_list
            ? bulkForm.data.student_list.split(/\s|,/).map((id) => id.trim()).filter(Boolean).map(Number)
            : [];

        const payload = {
            program_id: bulkForm.data.program_id,
            term_id: bulkForm.data.term_id,
            cohort: bulkForm.data.cohort || null,
            override: bulkForm.data.override,
            override_reason: bulkForm.data.override_reason || null,
            force_waitlist: bulkForm.data.force_waitlist,
            student_ids: studentIds,
        };

        router.post(routes.bulkEnroll, payload, {
            preserveScroll: true,
            onSuccess: () => {
                success('Bulk enrollment processed.');
                loadRoster(cursor);
            },
            onError: () => error('Bulk enrollment encountered errors. Review the response for details.'),
        });
    };

    const handleDrop = (enrollment) => {
        confirmAction({
            message: `Drop ${enrollment.student?.name ?? 'this student'} from the section?`,
            action: () => {
                const override = window.confirm('Apply override? Choose “Cancel” for no override.');
                const reason = override ? window.prompt('Provide override reason (optional)', '') : '';

                router.delete(route(routes.drop, { section: section.id, enrollment: enrollment.id }), {
                    data: {
                        override,
                        override_reason: reason || null,
                    },
                    preserveScroll: true,
                    onSuccess: () => {
                        success('Enrollment dropped.');
                        setSelectedIds((current) => current.filter((value) => value !== enrollment.id));
                        loadRoster(cursor);
                    },
                    onError: () => error('Failed to drop enrollment.'),
                });
            },
        });
    };

    const moveToAuditor = (enrollment) => {
        router.patch(route('admin.sections.enrollments.update', { section: section.id, enrollment: enrollment.id }), {
            role: 'auditor',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                success(`${enrollment.student?.name ?? 'Student'} moved to auditor.`);
                loadRoster(cursor);
            },
            onError: () => error('Unable to update enrollment role.'),
        });
    };

    const applyBulkStatus = (status) => {
        if (!selectedIds.length) {
            error('Select enrollments first.');
            return;
        }

        Promise.all(selectedIds.map((id) => window.axios.patch(route('admin.sections.enrollments.update', { section: section.id, enrollment: id }), { status })))
            .then(() => {
                success('Statuses updated.');
                setShowBulkModal(false);
                setSelectedIds([]);
                loadRoster(cursor);
            })
            .catch(() => error('Failed to update one or more enrollments.'));
    };

    const studentSelectOptions = useMemo(() => studentOptions?.map((student) => (
        <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
    )) ?? [], [studentOptions]);

    return (
        <>
            <Head title={`Section Roster — ${section.course?.code ?? ''} ${section.code ?? ''}`} />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Roster · {section.course?.code} {section.code}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Capacity {section.capacity} · Waitlist {section.waitlist_cap}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <SecondaryButton onClick={() => setShowBulkModal(true)} disabled={!selectedIds.length}>Mark Completed/Failed</SecondaryButton>
                        <SecondaryButton onClick={() => window.alert('CSV import template coming soon.')}>CSV Template</SecondaryButton>
                    </div>
                </div>

                <div className="px-6 py-5">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <InputLabel htmlFor="roster-search" value="Search" />
                            <TextInput
                                id="roster-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Student name or email"
                                className="mt-1 block w-full"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="roster-status" value="Status" />
                            <select
                                id="roster-status"
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
                            <InputLabel htmlFor="roster-role" value="Role" />
                            <select
                                id="roster-role"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">All roles</option>
                                {roleOptions.map((option) => (
                                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Enroll a Student</h3>
                            <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="enroll-student" value="Select Student" />
                                    <select
                                        id="enroll-student"
                                        value={enrollForm.data.student_id}
                                        onChange={(e) => enrollForm.setData('student_id', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Choose a student</option>
                                        {studentSelectOptions}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="enroll-role" value="Role" />
                                    <select
                                        id="enroll-role"
                                        value={enrollForm.data.role}
                                        onChange={(e) => enrollForm.setData('role', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        {roleOptions.map((option) => (
                                            <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox id="enroll-force" checked={enrollForm.data.force_waitlist} onChange={(e) => enrollForm.setData('force_waitlist', e.target.checked)} />
                                    <InputLabel htmlFor="enroll-force" value="Force waitlist" className="m-0" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox id="enroll-override" checked={enrollForm.data.override} onChange={(e) => enrollForm.setData('override', e.target.checked)} />
                                    <InputLabel htmlFor="enroll-override" value="Override restrictions" className="m-0" />
                                </div>
                                {enrollForm.data.override && (
                                    <div className="sm:col-span-2">
                                        <InputLabel htmlFor="enroll-reason" value="Override reason" />
                                        <TextInput
                                            id="enroll-reason"
                                            value={enrollForm.data.override_reason || ''}
                                            onChange={(e) => enrollForm.setData('override_reason', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 text-right">
                                <PrimaryButton onClick={submitEnroll} disabled={enrollForm.processing}>
                                    {enrollForm.processing ? 'Enrolling…' : 'Enroll Student'}
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Bulk Enrollment</h3>
                            <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="bulk-program" value="Program" />
                                    <select
                                        id="bulk-program"
                                        value={bulkForm.data.program_id}
                                        onChange={(e) => bulkForm.setData('program_id', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select a program</option>
                                        {programOptions.map((programOption) => (
                                            <option key={programOption.id} value={programOption.id}>{programOption.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="bulk-term" value="Term" />
                                    <select
                                        id="bulk-term"
                                        value={bulkForm.data.term_id}
                                        onChange={(e) => bulkForm.setData('term_id', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select a term</option>
                                        {termOptions.map((term) => (
                                            <option key={term.id} value={term.id}>{term.title || term.code}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="bulk-cohort" value="Cohort Filter" />
                                    <TextInput
                                        id="bulk-cohort"
                                        value={bulkForm.data.cohort || ''}
                                        onChange={(e) => bulkForm.setData('cohort', e.target.value)}
                                        placeholder="Optional cohort label"
                                        className="mt-1 block w-full"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="bulk-students" value="Specific Student IDs" />
                                    <textarea
                                        id="bulk-students"
                                        value={bulkForm.data.student_list}
                                        onChange={(e) => bulkForm.setData('student_list', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        placeholder="Paste IDs or emails separated by commas or spaces"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox id="bulk-override" checked={bulkForm.data.override} onChange={(e) => bulkForm.setData('override', e.target.checked)} />
                                    <InputLabel htmlFor="bulk-override" value="Override restrictions" className="m-0" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox id="bulk-waitlist" checked={bulkForm.data.force_waitlist} onChange={(e) => bulkForm.setData('force_waitlist', e.target.checked)} />
                                    <InputLabel htmlFor="bulk-waitlist" value="Force waitlist" className="m-0" />
                                </div>
                                {bulkForm.data.override && (
                                    <div className="sm:col-span-2">
                                        <InputLabel htmlFor="bulk-reason" value="Override reason" />
                                        <TextInput
                                            id="bulk-reason"
                                            value={bulkForm.data.override_reason || ''}
                                            onChange={(e) => bulkForm.setData('override_reason', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 text-right">
                                <PrimaryButton onClick={submitBulkEnroll} disabled={bulkForm.processing}>
                                    {bulkForm.processing ? 'Processing…' : 'Run Bulk Enrollment'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-900/70">
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    <th className="px-4 py-3 w-12">
                                        <Checkbox
                                            checked={selectedIds.length > 0 && selectedIds.length === (roster.data?.length ?? 0)}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Enrolled</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading roster…</td>
                                    </tr>
                                ) : roster.data?.length ? (
                                    roster.data.map((enrollment) => (
                                        <tr key={enrollment.id} className="align-top">
                                            <td className="px-4 py-3">
                                                <Checkbox checked={selectedIds.includes(enrollment.id)} onChange={() => toggleSelection(enrollment.id)} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                <div className="font-semibold">{enrollment.student?.name ?? 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{enrollment.student?.email}</div>
                                                <ConflictList conflicts={enrollment.conflicts} />
                                            </td>
                                            <td className="px-4 py-3 text-sm"><StatusPill status={enrollment.status} /></td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 capitalize">{enrollment.role}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : '—'}</td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <div className="inline-flex gap-2">
                                                    {enrollment.role !== 'auditor' && (
                                                        <SecondaryButton onClick={() => moveToAuditor(enrollment)}>Move to Auditor</SecondaryButton>
                                                    )}
                                                    <DangerButton onClick={() => handleDrop(enrollment)}>Drop</DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No enrollments yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            Showing {roster.data?.length ?? 0} students
                        </div>
                        <div className="flex gap-2">
                            <SecondaryButton disabled={!roster.prev_cursor} onClick={() => roster.prev_cursor && loadRoster(roster.prev_cursor)}>Previous</SecondaryButton>
                            <SecondaryButton disabled={!roster.next_cursor} onClick={() => roster.next_cursor && loadRoster(roster.next_cursor)}>Next</SecondaryButton>
                        </div>
                    </div>
                </div>
            </div>

            <BulkCompleteModal
                open={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                onSubmit={applyBulkStatus}
                selected={selectedIds}
            />
        </>
    );
}

export default function SectionRoster() {
    const { props } = usePage();
    const titleParts = [props.section?.course?.code, props.section?.code].filter(Boolean).join(' ');
    const pageTitle = titleParts ? `Section Roster — ${titleParts}` : 'Section Roster';

    return (
        <AdminLayout title={pageTitle} header="Section Roster">
            <RosterPage />
        </AdminLayout>
    );
}
