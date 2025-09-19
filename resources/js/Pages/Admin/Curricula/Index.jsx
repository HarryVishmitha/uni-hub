import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';
import DangerButton from '@/Components/DangerButton.jsx';
import Modal from '@/Components/Modal.jsx';
import TextInput from '@/Components/TextInput.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import InputError from '@/Components/InputError.jsx';

export default function Index() {
    const { props } = usePage();
    const { curricula, programs, filters } = props;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [programFilter, setProgramFilter] = useState(filters?.program_id ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [requirementsTarget, setRequirementsTarget] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('admin.curricula.index'), { search, program_id: programFilter }, { preserveState: true, replace: true });
        }, 250);
        return () => clearTimeout(timeout);
    }, [search, programFilter]);

    const onDelete = (curriculum) => {
        if (confirm(`Archive curriculum ${curriculum.version}?`)) {
            router.delete(route('admin.curricula.destroy', curriculum.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Curricula" header="Curricula">
            <Head title="Curricula" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Curriculum Versions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Track program requirements and minimum credit rules.</p>
                    </div>
                    <PrimaryButton onClick={() => setIsCreateOpen(true)}>New Curriculum</PrimaryButton>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="curriculum-search" value="Search" />
                            <TextInput id="curriculum-search" className="mt-1 block w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Version" />
                        </div>
                        <div>
                            <InputLabel htmlFor="curriculum-program" value="Program" />
                            <select
                                id="curriculum-program"
                                value={programFilter ?? ''}
                                onChange={(e) => setProgramFilter(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">All programs</option>
                                {programs?.map((program) => (
                                    <option key={program.id} value={program.id}>{program.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/60">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Version</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Program</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Branch</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Effective</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Min Credits</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Requirements</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-900 dark:bg-gray-900">
                                {curricula?.data?.length ? (
                                    curricula.data.map((curriculum) => (
                                        <tr key={curriculum.id}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{curriculum.version}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                <div>{curriculum.program.title}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{curriculum.program.org_unit.name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{curriculum.branch.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{curriculum.effective_from ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{curriculum.min_credits ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{curriculum.requirements_count}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${curriculum.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                    {curriculum.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <SecondaryButton onClick={() => setRequirementsTarget(curriculum)}>Requirements</SecondaryButton>
                                                    <SecondaryButton onClick={() => setEditing(curriculum)}>Edit</SecondaryButton>
                                                    <DangerButton onClick={() => onDelete(curriculum)} disabled={curriculum.requirements_count > 0}>Archive</DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={8}>No curricula found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {curricula?.links && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {curricula.links.map((link) => (
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

            <CreateModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                programs={programs}
            />

            <EditModal
                curriculum={editing}
                programs={programs}
                onClose={() => setEditing(null)}
            />

            <RequirementsModal
                curriculum={requirementsTarget}
                onClose={() => setRequirementsTarget(null)}
            />
        </AdminLayout>
    );
}

function CreateModal({ open, onClose, programs }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        program_id: programs?.[0]?.id ?? '',
        version: '',
        status: 'active',
        effective_from: '',
        min_credits: '',
        notes: '',
    });

    useEffect(() => {
        if (!open) {
            reset({
                program_id: programs?.[0]?.id ?? '',
                version: '',
                status: 'active',
                effective_from: '',
                min_credits: '',
                notes: '',
            });
        }
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        let notesPayload = {};
        if (data.notes) {
            try {
                notesPayload = JSON.parse(data.notes);
            } catch (error) {
                alert('Notes must be valid JSON');
                return;
            }
        }

        transform((formData) => ({
            ...formData,
            notes: notesPayload,
            min_credits: formData.min_credits || null,
        })).post(route('admin.curricula.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={open} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Curriculum</h3>

                <div>
                    <InputLabel htmlFor="create-program" value="Program" />
                    <select
                        id="create-program"
                        value={data.program_id}
                        onChange={(e) => setData('program_id', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        {programs?.map((program) => (
                            <option key={program.id} value={program.id}>{program.title}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.program_id} />
                </div>

                <div>
                    <InputLabel htmlFor="create-version" value="Version" />
                    <TextInput id="create-version" className="mt-1 block w-full" value={data.version} onChange={(e) => setData('version', e.target.value)} required />
                    <InputError className="mt-2" message={errors.version} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="create-status" value="Status" />
                        <TextInput id="create-status" className="mt-1 block w-full" value={data.status} onChange={(e) => setData('status', e.target.value)} />
                        <InputError className="mt-2" message={errors.status} />
                    </div>
                    <div>
                        <InputLabel htmlFor="create-effective" value="Effective From" />
                        <TextInput id="create-effective" type="date" className="mt-1 block w-full" value={data.effective_from} onChange={(e) => setData('effective_from', e.target.value)} />
                        <InputError className="mt-2" message={errors.effective_from} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="create-min-credits" value="Minimum Credits" />
                    <TextInput id="create-min-credits" type="number" min="0" className="mt-1 block w-full" value={data.min_credits} onChange={(e) => setData('min_credits', e.target.value)} />
                    <InputError className="mt-2" message={errors.min_credits} />
                </div>

                <div>
                    <InputLabel htmlFor="create-notes" value="Notes (JSON)" />
                    <textarea
                        id="create-notes"
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        rows={3}
                    />
                    <InputError className="mt-2" message={errors.notes} />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Create</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function EditModal({ curriculum, programs, onClose }) {
    const { data, setData, put, processing, errors, reset, transform } = useForm({
        version: '',
        status: '',
        effective_from: '',
        min_credits: '',
        notes: '',
    });

    useEffect(() => {
        if (curriculum) {
            setData((current) => ({
                ...current,
                version: curriculum.version,
                status: curriculum.status ?? '',
                effective_from: curriculum.effective_from ?? '',
                min_credits: curriculum.min_credits ?? '',
                notes: JSON.stringify(curriculum.notes ?? {}, null, 2),
            }));
        }
    }, [curriculum]);

    if (!curriculum) {
        return null;
    }

    const submit = (e) => {
        e.preventDefault();
        let notesPayload = {};
        if (data.notes) {
            try {
                notesPayload = JSON.parse(data.notes);
            } catch (error) {
                alert('Notes must be valid JSON');
                return;
            }
        }

        transform((formData) => ({
            ...formData,
            notes: notesPayload,
            min_credits: formData.min_credits || null,
        })).put(route('admin.curricula.update', curriculum.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={!!curriculum} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Curriculum</h3>

                <div>
                    <InputLabel value="Program" />
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {curriculum.program.title}
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="edit-version" value="Version" />
                    <TextInput id="edit-version" className="mt-1 block w-full" value={data.version} onChange={(e) => setData('version', e.target.value)} required />
                    <InputError className="mt-2" message={errors.version} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="edit-status" value="Status" />
                        <TextInput id="edit-status" className="mt-1 block w-full" value={data.status} onChange={(e) => setData('status', e.target.value)} />
                        <InputError className="mt-2" message={errors.status} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-effective" value="Effective From" />
                        <TextInput id="edit-effective" type="date" className="mt-1 block w-full" value={data.effective_from} onChange={(e) => setData('effective_from', e.target.value)} />
                        <InputError className="mt-2" message={errors.effective_from} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="edit-min-credits" value="Minimum Credits" />
                    <TextInput id="edit-min-credits" type="number" min="0" className="mt-1 block w-full" value={data.min_credits} onChange={(e) => setData('min_credits', e.target.value)} />
                    <InputError className="mt-2" message={errors.min_credits} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-notes" value="Notes (JSON)" />
                    <textarea
                        id="edit-notes"
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        rows={3}
                    />
                    <InputError className="mt-2" message={errors.notes} />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function RequirementsModal({ curriculum, onClose }) {
    const { post, put, delete: destroy, processing, errors, reset, setData, data, transform } = useForm({
        code: '',
        title: '',
        requirement_type: 'core',
        credit_value: '',
        rules: '',
        is_required: true,
    });
    const [editingRequirement, setEditingRequirement] = useState(null);

    useEffect(() => {
        if (!curriculum) {
            reset({
                code: '',
                title: '',
                requirement_type: 'core',
                credit_value: '',
                rules: '',
                is_required: true,
            });
            setEditingRequirement(null);
        }
    }, [curriculum]);

    if (!curriculum) {
        return null;
    }

    const rulesValue = (value) => {
        try {
            return value ? JSON.parse(value) : {};
        } catch (error) {
            throw new Error('Invalid JSON');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let parsedRules = {};
        try {
            parsedRules = rulesValue(data.rules);
        } catch (error) {
            alert('Rules must be valid JSON');
            return;
        }

        if (editingRequirement) {
            transform((formData) => ({
                ...formData,
                rules: parsedRules,
                credit_value: formData.credit_value || null,
            })).put(route('admin.curricula.requirements.update', [curriculum.id, editingRequirement.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingRequirement(null);
                    reset({
                        code: '',
                        title: '',
                        requirement_type: 'core',
                        credit_value: '',
                        rules: '',
                        is_required: true,
                    });
                },
            });
        } else {
            transform((formData) => ({
                ...formData,
                rules: parsedRules,
                credit_value: formData.credit_value || null,
            })).post(route('admin.curricula.requirements.store', curriculum.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset({
                        code: '',
                        title: '',
                        requirement_type: 'core',
                        credit_value: '',
                        rules: '',
                        is_required: true,
                    });
                },
            });
        }
    };

    const startEdit = (requirement) => {
        setEditingRequirement(requirement);
        reset({
            code: requirement.code ?? '',
            title: requirement.title,
            requirement_type: requirement.requirement_type,
            credit_value: requirement.credit_value ?? '',
            rules: JSON.stringify(requirement.rules ?? {}, null, 2),
            is_required: requirement.is_required,
        });
    };

    const onDestroy = (requirement) => {
        if (confirm(`Archive requirement ${requirement.title}?`)) {
            destroy(route('admin.curricula.requirements.destroy', [curriculum.id, requirement.id]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <Modal show={!!curriculum} onClose={() => { reset(); onClose(); }} maxWidth="2xl">
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Requirements · {curriculum.version}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Program: {curriculum.program.title}</p>
                    </div>
                    <SecondaryButton onClick={() => { reset(); setEditingRequirement(null); }}>New Requirement</SecondaryButton>
                </div>

                <div className="space-y-3">
                    {curriculum.requirements?.length ? curriculum.requirements.map((requirement) => (
                        <div key={requirement.id} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{requirement.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{requirement.requirement_type} · {requirement.credit_value ?? '—'} credits</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SecondaryButton onClick={() => startEdit(requirement)}>Edit</SecondaryButton>
                                    <DangerButton onClick={() => onDestroy(requirement)}>Archive</DangerButton>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            No requirements yet.
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{editingRequirement ? 'Edit Requirement' : 'Add Requirement'}</h4>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="req-code" value="Code" />
                            <TextInput id="req-code" className="mt-1 block w-full" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                            <InputError className="mt-2" message={errors.code} />
                        </div>
                        <div>
                            <InputLabel htmlFor="req-type" value="Type" />
                            <select
                                id="req-type"
                                value={data.requirement_type}
                                onChange={(e) => setData('requirement_type', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="core">Core</option>
                                <option value="elective">Elective</option>
                            </select>
                            <InputError className="mt-2" message={errors.requirement_type} />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="req-title" value="Title" />
                        <TextInput id="req-title" className="mt-1 block w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                        <InputError className="mt-2" message={errors.title} />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="req-credits" value="Credit Value" />
                            <TextInput id="req-credits" type="number" min="0" className="mt-1 block w-full" value={data.credit_value} onChange={(e) => setData('credit_value', e.target.value)} />
                            <InputError className="mt-2" message={errors.credit_value} />
                        </div>
                        <div>
                            <label className="flex h-full items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={data.is_required} onChange={(e) => setData('is_required', e.target.checked)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                                Required
                            </label>
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="req-rules" value="Rules (JSON)" />
                        <textarea
                            id="req-rules"
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            value={data.rules}
                            onChange={(e) => setData('rules', e.target.value)}
                            rows={3}
                        />
                        <InputError className="mt-2" message={errors.rules} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={() => { reset(); setEditingRequirement(null); }}>Reset</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>{editingRequirement ? 'Save Changes' : 'Add Requirement'}</PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
