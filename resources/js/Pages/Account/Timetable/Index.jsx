import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import { useEffect, useMemo, useState } from 'react';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dayName = (index) => dayNames[index] ?? 'Day';

function MeetingCard({ item }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{item.course_code} — {item.course_title}</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">{dayName(item.day_of_week)}</span>
            </div>
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {item.start_time} – {item.end_time} · {item.modality === 'onsite' ? item.room || 'Room TBD' : item.modality}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Status: {item.status}</div>
        </div>
    );
}

function UpcomingCard({ occurrence }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{occurrence.course_code} — {occurrence.course_title}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">{occurrence.day_name}</span>
            </div>
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {new Date(occurrence.start).toLocaleString()} – {new Date(occurrence.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Status: {occurrence.status}</div>
        </div>
    );
}

function TimetablePage() {
    const { props } = usePage();
    const { schedule = {}, upcoming = [], termOptions = [], filters = {}, icsUrl } = props;

    const [termId, setTermId] = useState(filters.term_id ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('account.timetable.index'), { term_id: termId || undefined }, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(timeout);
    }, [termId]);

    const normalizedSchedule = useMemo(() => {
        return Object.entries(schedule).map(([day, items]) => ({ day: Number(day), items }));
    }, [schedule]);

    return (
        <>
            <Head title="My Timetable" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <InputLabel htmlFor="timetable-term" value="Term" />
                            <select
                                id="timetable-term"
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
                    </div>
                    <PrimaryButton as="a" href={icsUrl} target="_blank" rel="noopener">
                        Download ICS
                    </PrimaryButton>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {normalizedSchedule.map(({ day, items }) => (
                        <div key={day} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{dayName(day)}</h3>
                            <div className="mt-3 space-y-3">
                                {items.length ? items.map((item) => (
                                    <MeetingCard key={item.meeting_id} item={item} />
                                )) : (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">No classes scheduled this day.</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Upcoming Classes</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {upcoming.length ? upcoming.map((occurrence, idx) => (
                            <UpcomingCard key={`${occurrence.section_id}-${occurrence.meeting_id}-${idx}`} occurrence={occurrence} />
                        )) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">No upcoming meetings found in the next window.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function TimetableLayout() {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">My Timetable</h2>}
            homeRoute="account.timetable.index"
            homeLabel="My Timetable"
        >
            <TimetablePage />
        </AuthenticatedLayout>
    );
}
