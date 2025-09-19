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
    const { orgUnits, branches, parentOptions, types, filters, auth } = props;
    const roles = auth?.roles ?? [];
    const isSuperAdmin = roles.includes('super_admin');

    const [search, setSearch] = useState(filters?.search ?? '');
    const [branchId, setBranchId] = useState(filters?.branch_id ?? (isSuperAdmin ? '' : branches?.[0]?.id ?? ''));
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('admin.org-units.index'), { search, branch_id: branchId }, { preserveState: true, replace: true });
        }, 250);
        return () => clearTimeout(timeout);
    }, [search, branchId]);

    const filteredParents = useMemo(() => {
        return parentOptions?.filter((option) => !branchId || option.branch_id === Number(branchId));
    }, [parentOptions, branchId]);

    const byBranch = useMemo(() => {
        const groups = {};
        (orgUnits ?? []).forEach((unit) => {
            const key = unit.branch.id;
            if (!groups[key]) {
                groups[key] = { branch: unit.branch, items: [] };
            }
            groups[key].items.push(unit);
        });
        return Object.values(groups);
    }, [orgUnits]);

    const onDelete = (unit) => {
        if (confirm(`Archive ${unit.name}?`)) {
            router.delete(route('admin.org-units.destroy', unit.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Org Units" header="Org Units">
            <Head title="Org Units" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Academic Structure</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Faculties, schools, divisions, and departments scoped per branch.</p>
                    </div>
                    <PrimaryButton onClick={() => setIsCreateOpen(true)}>New Org Unit</PrimaryButton>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 flex flex-wrap items-end gap-4">
                        <div className="w-full max-w-sm">
                            <InputLabel htmlFor="unit-search" value="Search" />
                            <TextInput id="unit-search" className="mt-1 block w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code" />
                        </div>
                        {isSuperAdmin && (
                            <div className="w-full max-w-xs">
                                <InputLabel htmlFor="filter-branch" value="Branch" />
                                <select
                                    id="filter-branch"
                                    value={branchId ?? ''}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                    <option value="">All branches</option>
                                    {branches?.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {byBranch.length ? byBranch.map((group) => (
                            <section key={group.branch.id} className="rounded-xl border border-gray-200 dark:border-gray-800">
                                <header className="flex items-center justify-between gap-4 bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group.branch.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{group.branch.code}</div>
                                    </div>
                                </header>
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {group.items.map((unit) => (
                                        <article key={unit.id} className="grid gap-4 px-4 py-3 md:grid-cols-6">
                                            <div className="md:col-span-2">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{unit.name}</div>
                                                <div className="text-xs font-mono uppercase tracking-wide text-gray-500 dark:text-gray-400">{unit.code}</div>
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300">{unit.type}</div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                {unit.parent ? (
                                                    <>
                                                        <div>{unit.parent.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{unit.parent.type}</div>
                                                    </>
                                                ) : <span className="text-xs text-gray-400">Top level</span>}
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300">Programs: {unit.programs_count ?? 0}</div>
                                            <div className="flex items-center justify-end gap-2">
                                                <SecondaryButton onClick={() => setEditing(unit)}>Edit</SecondaryButton>
                                                <DangerButton onClick={() => onDelete(unit)} disabled={unit.programs_count > 0}>
                                                    Archive
                                                </DangerButton>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )) : (
                            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                No org units found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                branches={branches}
                parentOptions={filteredParents}
                types={types}
                isSuperAdmin={isSuperAdmin}
            />

            <EditModal
                unit={editing}
                onClose={() => setEditing(null)}
                branches={branches}
                parentOptions={parentOptions}
                types={types}
                canChangeBranch={isSuperAdmin}
            />
        </AdminLayout>
    );
}

function CreateModal({ open, onClose, branches, parentOptions, types, isSuperAdmin }) {
    const initialBranch = isSuperAdmin ? (branches?.[0]?.id ?? '') : branches?.[0]?.id ?? '';
    const { data, setData, post, processing, errors, reset } = useForm({
        branch_id: initialBranch,
        name: '',
        code: '',
        type: types?.[0] ?? 'department',
        parent_id: '',
    });

    useEffect(() => {
        if (!open) {
            reset({
                branch_id: initialBranch,
                name: '',
                code: '',
                type: types?.[0] ?? 'department',
                parent_id: '',
            });
        }
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.org-units.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const availableParents = useMemo(() => {
        if (!data.branch_id) {
            return parentOptions;
        }
        return parentOptions?.filter((option) => option.branch_id === Number(data.branch_id));
    }, [parentOptions, data.branch_id]);

    return (
        <Modal show={open} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Org Unit</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    {isSuperAdmin && (
                        <div>
                            <InputLabel htmlFor="create-branch" value="Branch" />
                            <select
                                id="create-branch"
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                {branches?.map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                            <InputError className="mt-2" message={errors.branch_id} />
                        </div>
                    )}
                    <div>
                        <InputLabel htmlFor="create-type" value="Type" />
                        <select
                            id="create-type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            {types?.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.type} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="create-name" value="Name" />
                    <TextInput id="create-name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="create-code" value="Code" />
                    <TextInput id="create-code" className="mt-1 block w-full uppercase" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                    <InputError className="mt-2" message={errors.code} />
                </div>

                <div>
                    <InputLabel htmlFor="create-parent" value="Parent" />
                    <select
                        id="create-parent"
                        value={data.parent_id ?? ''}
                        onChange={(e) => setData('parent_id', e.target.value || '')}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">Top level</option>
                        {availableParents?.map((option) => (
                            <option key={option.id} value={option.id}>{option.name} · {option.type}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.parent_id} />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Create</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function EditModal({ unit, onClose, branches, parentOptions, types, canChangeBranch }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        branch_id: '',
        name: '',
        code: '',
        type: '',
        parent_id: '',
    });

    useEffect(() => {
        if (unit) {
            setData('branch_id', unit.branch.id);
            setData('name', unit.name);
            setData('code', unit.code);
            setData('type', unit.type);
            setData('parent_id', unit.parent_id ?? '');
        }
    }, [unit]);

    if (!unit) {
        return null;
    }

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.org-units.update', unit.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    const availableParents = useMemo(() => {
        return parentOptions?.filter((option) => option.branch_id === unit.branch.id && option.id !== unit.id);
    }, [parentOptions, unit]);

    return (
        <Modal show={!!unit} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Org Unit</h3>

                {canChangeBranch && (
                    <div>
                        <InputLabel htmlFor="edit-branch" value="Branch" />
                        <select
                            id="edit-branch"
                            value={data.branch_id}
                            disabled
                            className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-100 text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        >
                            {branches?.map((branch) => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="edit-type" value="Type" />
                        <select
                            id="edit-type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            {types?.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.type} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-parent" value="Parent" />
                        <select
                            id="edit-parent"
                            value={data.parent_id ?? ''}
                            onChange={(e) => setData('parent_id', e.target.value || '')}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="">Top level</option>
                            {availableParents?.map((option) => (
                                <option key={option.id} value={option.id}>{option.name} · {option.type}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.parent_id} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="edit-name" value="Name" />
                    <TextInput id="edit-name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-code" value="Code" />
                    <TextInput id="edit-code" className="mt-1 block w-full uppercase" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                    <InputError className="mt-2" message={errors.code} />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
