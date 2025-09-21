import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';
import DangerButton from '@/Components/DangerButton.jsx';
import TextInput from '@/Components/TextInput.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import Modal from '@/Components/Modal.jsx';
import { useAlerts } from '@/Contexts/AlertContext';
import { confirmAction } from '@/Utils/AlertUtils';

function TranscriptModal({ show, onClose, onSave, transcript, courseOptions, termOptions, studentOptions }) {
    const [formState, setFormState] = useState({
        student_id: '',
        course_id: '',
        term_id: '',
        final_grade: '',
        grade_points: '',
        published_at: '',
    });

    useEffect(() => {
        if (transcript) {
            setFormState({
                student_id: transcript.student?.id ?? '',
                course_id: transcript.course?.id ?? '',
                term_id: transcript.term?.id ?? '',
                final_grade: transcript.final_grade ?? '',
                grade_points: transcript.grade_points ?? '',
                published_at: transcript.published_at ? transcript.published_at.substring(0, 10) : '',
            });
        } else {
            setFormState({
                student_id: '',
                course_id: '',
                term_id: '',
                final_grade: '',
                grade_points: '',
                published_at: '',
            });
        }
    }, [transcript]);

    const updateField = (field, value) => setFormState((prev) => ({ ...prev, [field]: value }));

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{transcript ? 'Update Transcript' : 'Create Transcript'}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="transcript-student" value="Student" />
                        <select
                            id="transcript-student"
                            value={formState.student_id}
                            onChange={(e) => updateField('student_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">Select student</option>
                            {studentOptions.map((student) => (
                                <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="transcript-course" value="Course" />
                        <select
                            id="transcript-course"
                            value={formState.course_id}
                            onChange={(e) => updateField('course_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">Select course</option>
                            {courseOptions.map((course) => (
                                <option key={course.id} value={course.id}>{course.code} — {course.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="transcript-term" value="Term" />
                        <select
                            id="transcript-term"
                            value={formState.term_id}
                            onChange={(e) => updateField('term_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">Select term</option>
                            {termOptions.map((term) => (
                                <option key={term.id} value={term.id}>{term.title || term.code}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="transcript-grade" value="Final Grade" />
                        <TextInput
                            id="transcript-grade"
                            value={formState.final_grade}
                            onChange={(e) => updateField('final_grade', e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="transcript-points" value="Grade Points" />
                        <TextInput
                            id="transcript-points"
                            type="number"
                            step="0.01"
                            value={formState.grade_points}
                            onChange={(e) => updateField('grade_points', e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="transcript-published" value="Published At" />
                        <TextInput
                            id="transcript-published"
                            type="date"
                            value={formState.published_at}
                            onChange={(e) => updateField('published_at', e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={() => onSave(formState)}>{transcript ? 'Save changes' : 'Create transcript'}</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

function TranscriptsPage() {
    const { props } = usePage();
    const { transcripts, termOptions = [], courseOptions = [], branchOptions = [], studentOptions = [], filters = {} } = props;
    const { success, error } = useAlerts();

    const [search, setSearch] = useState(filters.search ?? '');
    const [courseId, setCourseId] = useState(filters.course_id ?? '');
    const [termId, setTermId] = useState(filters.term_id ?? '');
    const [branchId, setBranchId] = useState(filters.branch_id ?? '');
    const [published, setPublished] = useState(filters.published ?? '');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('admin.transcripts.index'), {
                search: search || undefined,
                course_id: courseId || undefined,
                term_id: termId || undefined,
                branch_id: branchId || undefined,
                published: published !== '' ? published : undefined,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, courseId, termId, branchId, published]);

    const openCreate = () => {
        setEditing(null);
        setShowModal(true);
    };

    const openEdit = (transcript) => {
        setEditing(transcript);
        setShowModal(true);
    };

    const onCloseModal = () => {
        setShowModal(false);
        setEditing(null);
    };

    const saveTranscript = (payload) => {
        if (editing) {
            router.patch(route('admin.transcripts.update', editing.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    success('Transcript updated.');
                    onCloseModal();
                    router.reload({ only: ['transcripts'] });
                },
                onError: () => error('Unable to update transcript.'),
            });
        } else {
            router.post(route('admin.transcripts.store'), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    success('Transcript created.');
                    onCloseModal();
                    router.reload({ only: ['transcripts'] });
                },
                onError: () => error('Unable to create transcript.'),
            });
        }
    };

    const deleteTranscript = (transcript) => {
        confirmAction({
            message: `Delete transcript for ${transcript.student?.name ?? 'this student'}?`,
            action: () => {
                router.delete(route('admin.transcripts.destroy', transcript.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        success('Transcript removed.');
                        router.reload({ only: ['transcripts'] });
                    },
                    onError: () => error('Failed to delete transcript.'),
                });
            },
        });
    };

    return (
        <>
            <Head title="Transcripts" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transcripts</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage student academic records and published grades.</p>
                    </div>
                    <PrimaryButton onClick={openCreate}>New Transcript</PrimaryButton>
                </div>

                <div className="px-6 py-5 space-y-6">
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="transcripts-search" value="Search" />
                            <TextInput
                                id="transcripts-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Student name or email"
                                className="mt-1 block w-full"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="transcripts-course" value="Course" />
                            <select
                                id="transcripts-course"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">All courses</option>
                                {courseOptions.map((course) => (
                                    <option key={course.id} value={course.id}>{course.code} — {course.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="transcripts-term" value="Term" />
                            <select
                                id="transcripts-term"
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
                            <InputLabel htmlFor="transcripts-branch" value="Branch" />
                            <select
                                id="transcripts-branch"
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">All branches</option>
                                {branchOptions.map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="transcripts-published" value="Published" />
                            <select
                                id="transcripts-published"
                                value={published}
                                onChange={(e) => setPublished(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">Any</option>
                                <option value="1">Published only</option>
                                <option value="0">Unpublished only</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-900/70">
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Term</th>
                                    <th className="px-4 py-3">Grade</th>
                                    <th className="px-4 py-3">Grade Points</th>
                                    <th className="px-4 py-3">Published</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                {transcripts?.data?.length ? transcripts.data.map((transcript) => (
                                    <tr key={transcript.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            <div className="font-semibold">{transcript.student?.name ?? 'Unknown'}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{transcript.student?.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{transcript.course?.code} — {transcript.course?.title}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{transcript.term?.title || transcript.term?.code || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{transcript.final_grade || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{transcript.grade_points ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{transcript.published_at ? new Date(transcript.published_at).toLocaleDateString() : 'Unpublished'}</td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <div className="inline-flex gap-2">
                                                <SecondaryButton onClick={() => openEdit(transcript)}>Edit</SecondaryButton>
                                                <DangerButton onClick={() => deleteTranscript(transcript)}>Delete</DangerButton>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No transcripts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transcripts?.links && (
                        <div className="flex flex-wrap items-center gap-2">
                            {transcripts.links.map((link) => (
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

            <TranscriptModal
                show={showModal}
                onClose={onCloseModal}
                onSave={saveTranscript}
                transcript={editing}
                courseOptions={courseOptions}
                termOptions={termOptions}
                studentOptions={studentOptions}
            />
        </>
    );
}

export default function AdminTranscriptsPage() {
    return (
        <AdminLayout title="Transcripts" header="Transcripts">
            <TranscriptsPage />
        </AdminLayout>
    );
}
