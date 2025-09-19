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
    const { programs, branches, orgUnits, filters, auth } = props;
    const roles = auth?.roles ?? [];
    const isSuperAdmin = roles.includes('super_admin');

    const [search, setSearch] = useState(filters?.search ?? '');
    const [branchFilter, setBranchFilter] = useState(filters?.branch_id ?? '');
    const [orgUnitFilter, setOrgUnitFilter] = useState(filters?.org_unit_id ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('admin.programs.index'), { search, branch_id: branchFilter, org_unit_id: orgUnitFilter }, { preserveState: true, replace: true });
        }, 250);
        return () => clearTimeout(timeout);
    }, [search, branchFilter, orgUnitFilter]);

    const orgUnitsForFilter = useMemo(() => {
        return orgUnits?.filter((unit) => !branchFilter || unit.branch_id === Number(branchFilter));
    }, [orgUnits, branchFilter]);

    const onDelete = (program) => {
        if (confirm(`Archive ${program.title}?`)) {
            router.delete(route('admin.programs.destroy', program.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Programs" header="Programs">
            <Head title="Programs" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Academic Programs</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage program metadata scoped to each branch.</p>
                    </div>
                    <PrimaryButton onClick={() => setIsCreateOpen(true)}>New Program</PrimaryButton>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="program-search" value="Search" />
                            <TextInput id="program-search" className="mt-1 block w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title" />
                        </div>
                        {isSuperAdmin && (
                            <div>
                                <InputLabel htmlFor="program-branch" value="Branch" />
                                <select
                                    id="program-branch"
                                    value={branchFilter ?? ''}
                                    onChange={(e) => {
                                        setBranchFilter(e.target.value);
                                        setOrgUnitFilter('');
                                    }}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                    <option value="">All branches</option>
                                    {branches?.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <InputLabel htmlFor="program-org-unit" value="Org Unit" />
                            <select
                                id="program-org-unit"
                                value={orgUnitFilter ?? ''}
                                onChange={(e) => setOrgUnitFilter(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                <option value="">All units</option>
                                {orgUnitsForFilter?.map((unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/60">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Program</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Org Unit</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Branch</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Level</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Duration (months)</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-900 dark:bg-gray-900">
                                {programs?.data?.length ? (
                                    programs.data.map((program) => (
                                        <tr key={program.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                <div className="font-medium">{program.title}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{program.modality ?? '—'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {program.org_unit.name}
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{program.org_unit.type}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{program.branch.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{program.level ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{program.duration_months ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${program.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                    {program.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <SecondaryButton onClick={() => setEditing(program)}>Edit</SecondaryButton>
                                                    <DangerButton onClick={() => onDelete(program)}>Archive</DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={7}>No programs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {programs?.links && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {programs.links.map((link) => (
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
                branches={branches}
                orgUnits={orgUnits}
                isSuperAdmin={isSuperAdmin}
            />

            <EditModal
                program={editing}
                onClose={() => setEditing(null)}
                orgUnits={orgUnits}
                branches={branches}
                isSuperAdmin={isSuperAdmin}
            />
        </AdminLayout>
    );
}

function CreateModal({ open, onClose, branches, orgUnits, isSuperAdmin }) {
    const initialBranch = isSuperAdmin ? '' : branches?.[0]?.id ?? '';
    const { data, setData, post, processing, errors, reset } = useForm({
        org_unit_id: '',
        title: '',
        description: '',
        level: '',
        modality: '',
        duration_months: '',
        status: 'active',
        branch_id: initialBranch,
    });

    useEffect(() => {
        if (open) {
            const defaultOrgUnit = isSuperAdmin
                ? ''
                : orgUnits?.find((unit) => unit.branch_id === branches?.[0]?.id)?.id ?? '';
            setData('org_unit_id', defaultOrgUnit);
        } else {
            reset({
                org_unit_id: '',
                title: '',
                description: '',
                level: '',
                modality: '',
                duration_months: '',
                status: 'active',
                branch_id: initialBranch,
            });
        }
    }, [open]);

    const filteredOrgUnits = useMemo(() => {
        if (isSuperAdmin) {
            if (!data.branch_id) {
                return orgUnits;
            }
            return orgUnits?.filter((unit) => unit.branch_id === Number(data.branch_id));
        }
        return orgUnits;
    }, [orgUnits, data.branch_id, isSuperAdmin]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.programs.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={open} onClose={() => { reset(); onClose(); }} maxWidth="xl">
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Program</h3>

                {isSuperAdmin && (
                    <div>
                        <InputLabel htmlFor="create-branch" value="Branch" />
                        <select
                            id="create-branch"
                            value={data.branch_id}
                            onChange={(e) => {
                                setData('branch_id', e.target.value);
                                setData('org_unit_id', '');
                            }}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">Select branch</option>
                            {branches?.map((branch) => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.branch_id} />
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="create-org-unit" value="Org Unit" />
                    <select
                        id="create-org-unit"
                        value={data.org_unit_id}
                        onChange={(e) => setData('org_unit_id', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">Select org unit</option>
                        {filteredOrgUnits?.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.org_unit_id} />
                </div>

                <div>
                    <InputLabel htmlFor="create-title" value="Title" />
                    <TextInput id="create-title" className="mt-1 block w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                    <InputError className="mt-2" message={errors.title} />
                </div>

                <div>
                    <InputLabel htmlFor="create-description" value="Description" />
                    <textarea
                        id="create-description"
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                    />
                    <InputError className="mt-2" message={errors.description} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="create-level" value="Level" />
                        <TextInput id="create-level" className="mt-1 block w-full" value={data.level} onChange={(e) => setData('level', e.target.value)} />
                        <InputError className="mt-2" message={errors.level} />
                    </div>
                    <div>
                        <InputLabel htmlFor="create-modality" value="Modality" />
                        <TextInput id="create-modality" className="mt-1 block w-full" value={data.modality} onChange={(e) => setData('modality', e.target.value)} />
                        <InputError className="mt-2" message={errors.modality} />
                    </div>
                    <div>
                        <InputLabel htmlFor="create-duration" value="Duration (months)" />
                        <TextInput
                            id="create-duration"
                            type="number"
                            min="1"
                            className="mt-1 block w-full"
                            value={data.duration_months}
                            onChange={(e) => setData('duration_months', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.duration_months} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="create-status" value="Status" />
                    <TextInput id="create-status" className="mt-1 block w-full" value={data.status} onChange={(e) => setData('status', e.target.value)} />
                    <InputError className="mt-2" message={errors.status} />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Create</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function EditModal({ program, onClose, orgUnits, branches, isSuperAdmin }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        org_unit_id: '',
        title: '',
        description: '',
        level: '',
        modality: '',
        duration_months: '',
        status: '',
        branch_id: '',
    });

    useEffect(() => {
        if (program) {
            setData((current) => ({
                ...current,
                org_unit_id: program.org_unit.id,
                title: program.title,
                description: program.description ?? '',
                level: program.level ?? '',
                modality: program.modality ?? '',
                duration_months: program.duration_months ?? '',
                status: program.status ?? '',
                branch_id: program.branch.id,
            }));
        }
    }, [program]);

    if (!program) {
        return null;
    }

    const filteredOrgUnits = useMemo(() => {
        return orgUnits?.filter((unit) => unit.branch_id === program.branch.id);
    }, [orgUnits, program]);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.programs.update', program.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={!!program} onClose={() => { reset(); onClose(); }} maxWidth="xl">
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Program</h3>

                {isSuperAdmin && (
                    <div>
                        <InputLabel value="Branch" />
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {program.branch.name}
                        </div>
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="edit-org-unit" value="Org Unit" />
                    <select
                        id="edit-org-unit"
                        value={data.org_unit_id}
                        onChange={(e) => setData('org_unit_id', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        {filteredOrgUnits?.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.org_unit_id} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-title" value="Title" />
                    <TextInput id="edit-title" className="mt-1 block w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                    <InputError className="mt-2" message={errors.title} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-description" value="Description" />
                    <textarea
                        id="edit-description"
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                    />
                    <InputError className="mt-2" message={errors.description} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="edit-level" value="Level" />
                        <TextInput id="edit-level" className="mt-1 block w-full" value={data.level} onChange={(e) => setData('level', e.target.value)} />
                        <InputError className="mt-2" message={errors.level} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-modality" value="Modality" />
                        <TextInput id="edit-modality" className="mt-1 block w-full" value={data.modality} onChange={(e) => setData('modality', e.target.value)} />
                        <InputError className="mt-2" message={errors.modality} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-duration" value="Duration (months)" />
                        <TextInput
                            id="edit-duration"
                            type="number"
                            min="1"
                            className="mt-1 block w-full"
                            value={data.duration_months}
                            onChange={(e) => setData('duration_months', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.duration_months} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="edit-status" value="Status" />
                    <TextInput id="edit-status" className="mt-1 block w-full" value={data.status} onChange={(e) => setData('status', e.target.value)} />
                    <InputError className="mt-2" message={errors.status} />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
