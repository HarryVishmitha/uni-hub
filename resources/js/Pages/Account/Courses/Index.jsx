import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import InputLabel from '@/Components/InputLabel.jsx';

function StatusBadge({ status }) {
    const palette = {
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        waitlisted: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        completed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
        failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${palette[status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300'}`}>
            {status}
        </span>
    );
}

function CourseCard({ enrollment }) {
    const section = enrollment.section;
    const course = enrollment.course;
    const term = enrollment.term;
    const lecturers = enrollment.lecturers ?? [];
    const meetings = enrollment.meetings ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course?.code} — {course?.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Section {section?.code ?? 'N/A'} · {term?.title || term?.code || 'Unassigned term'}</p>
                </div>
                <StatusBadge status={enrollment.status} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Meeting Times</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {meetings.length ? meetings.map((meeting) => (
                            <li key={meeting.id}>
                                {meeting.day_name} · {meeting.start_time} – {meeting.end_time} · {meeting.room?.label ?? meeting.modality}
                            </li>
                        )) : (
                            <li>No schedule published yet.</li>
                        )}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Lecturers</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {lecturers.length ? lecturers.map((lecturer) => (
                            <li key={lecturer.id}>{lecturer.name}{lecturer.email ? ` · ${lecturer.email}` : ''}</li>
                        )) : (
                            <li>Pending assignment.</li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Enrolled {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : '—'}
            </div>
        </div>
    );
}

function AccountCourses() {
    const { props } = usePage();
    const { enrollments = [], termOptions = [], statusOptions = [], filters = {} } = props;

    const [termId, setTermId] = useState(filters.term_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('account.courses.index'), {
                term_id: termId || undefined,
                status: status || undefined,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 200);

        return () => clearTimeout(timeout);
    }, [termId, status]);

    return (
        <>
            <Head title="My Courses" />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="courses-term" value="Term" />
                        <select
                            id="courses-term"
                            value={termId}
                            onChange={(e) => setTermId(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">All terms</option>
                            {termOptions.map((term) => (
                                <option key={term.id} value={term.id}>{term.title || term.code}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="courses-status" value="Status" />
                        <select
                            id="courses-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {enrollments.length ? enrollments.map((enrollment) => (
                        <CourseCard key={enrollment.id} enrollment={enrollment} />
                    )) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            No courses to display yet. Your active and waitlisted courses will appear here when enrollments are available.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function AccountCoursesPage() {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">My Courses</h2>}
            homeRoute="account.courses.index"
            homeLabel="My Courses"
        >
            <AccountCourses />
        </AuthenticatedLayout>
    );
}
