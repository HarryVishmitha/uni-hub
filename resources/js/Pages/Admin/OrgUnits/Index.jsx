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
import { useAlerts } from '@/Contexts/AlertContext';
import { confirmAction } from '@/Utils/AlertUtils';

// Inner component that uses AlertProvider from AdminLayout
function OrgUnitsIndex() {
    const { props } = usePage();
    const { orgUnits, branches, parentOptions, types, filters, auth } = props;
    const roles = auth?.roles ?? [];
    const isSuperAdmin = roles.includes('super_admin');
    const { success, error, warning, info } = useAlerts();

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
        confirmAction({
            message: `Are you sure you want to archive ${unit.name}?`,
            action: () => {
                router.delete(route('admin.org-units.destroy', unit.id), { 
                    preserveScroll: true,
                    onSuccess: () => success(`Organizational unit "${unit.name}" has been archived successfully`),
                    onError: (errors) => error(errors?.message || 'Failed to archive organizational unit')
                });
            }
        });
    };

    return (
        <>
            <Head title="Organizational Units" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Organizational Structure</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Build hierarchical trees of colleges, departments, and other administrative units.</p>
                    </div>
                    <PrimaryButton onClick={() => setIsCreateOpen(true)}>New Org Unit</PrimaryButton>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="orgunit-search" value="Search" />
                            <TextInput id="orgunit-search" className="mt-1 block w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or code" />
                        </div>
                        {isSuperAdmin && (
                            <div>
                                <InputLabel htmlFor="orgunit-branch" value="Branch" />
                                <select
                                    id="orgunit-branch"
                                    value={branchId}
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

                    {byBranch.map((group) => (
                        <div key={group.branch.id} className="mb-8">
                            <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-800">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{group.branch.name}</h3>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">{group.items.length} units</span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-gray-50 dark:bg-gray-800/60">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Parent Unit</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Programs</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {group.items.map((unit) => (
                                            <tr key={unit.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="font-medium">{unit.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{unit.code}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{unit.type}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{unit.parent?.name || '—'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{unit.programs_count}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${unit.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                                                        {unit.is_active ? 'Active' : 'Archived'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <SecondaryButton onClick={() => setEditing(unit)}>Edit</SecondaryButton>
                                                        <DangerButton onClick={() => onDelete(unit)} disabled={unit.programs_count > 0}>Archive</DangerButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {byBranch.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-gray-100">No organizational units found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start by creating a new organizational unit.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                branches={branches}
                parents={filteredParents}
                types={types}
                userBranchId={isSuperAdmin ? null : branches?.[0]?.id}
            />

            <EditModal
                unit={editing}
                onClose={() => setEditing(null)}
                branches={branches}
                parents={parentOptions}
                types={types}
                canChangeBranch={isSuperAdmin}
            />
        </>
    );
}

function CreateModal({ open, onClose, branches, parents, types, userBranchId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        branch_id: userBranchId ?? branches?.[0]?.id ?? '',
        name: '',
        code: '',
        type: types?.[0] ?? 'department',
        parent_id: '',
        is_active: true,
    });
    const { success, error } = useAlerts();

    const filteredParents = useMemo(() => {
        if (!data.branch_id) return [];
        return parents?.filter((p) => p.branch_id === Number(data.branch_id)) ?? [];
    }, [data.branch_id, parents]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.org-units.store'), {
            preserveScroll: true,
            onSuccess: () => {
                success(`Organizational unit "${data.name}" has been created successfully`);
                reset();
                onClose();
            },
            onError: (errors) => {
                error(Object.values(errors).flat().join('\n'));
            }
        });
    };

    return (
        <Modal show={open} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Organizational Unit</h3>

                {!userBranchId && (
                    <div>
                        <InputLabel htmlFor="create-branch" value="Branch" />
                        <select
                            id="create-branch"
                            value={data.branch_id}
                            onChange={(e) => {
                                setData('branch_id', e.target.value);
                                setData('parent_id', '');
                            }}
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
                    <InputLabel htmlFor="create-name" value="Name" />
                    <TextInput id="create-name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="create-code" value="Code" />
                    <TextInput id="create-code" className="mt-1 block w-full" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                    <InputError className="mt-2" message={errors.code} />
                </div>

                <div>
                    <InputLabel htmlFor="create-type" value="Type" />
                    <select
                        id="create-type"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        {types?.map((type) => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.type} />
                </div>

                <div>
                    <InputLabel htmlFor="create-parent" value="Parent Unit" />
                    <select
                        id="create-parent"
                        value={data.parent_id}
                        onChange={(e) => setData('parent_id', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">None (Top Level)</option>
                        {filteredParents.map((parent) => (
                            <option key={parent.id} value={parent.id}>{parent.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.parent_id} />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="create-active"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <InputLabel htmlFor="create-active" value="Active" className="m-0" />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Create</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function EditModal({ unit, onClose, branches, parents, types, canChangeBranch }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        branch_id: '',
        name: '',
        code: '',
        type: '',
        parent_id: '',
        is_active: true,
    });
    const { success, error } = useAlerts();

    useEffect(() => {
        if (unit) {
            setData({
                branch_id: unit.branch_id,
                name: unit.name,
                code: unit.code,
                type: unit.type,
                parent_id: unit.parent_id ?? '',
                is_active: unit.is_active,
            });
        }
    }, [unit]);

    const filteredParents = useMemo(() => {
        if (!data.branch_id) return [];
        return parents?.filter((p) => p.branch_id === Number(data.branch_id) && p.id !== unit?.id) ?? [];
    }, [data.branch_id, parents, unit?.id]);

    if (!unit) {
        return null;
    }

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.org-units.update', unit.id), {
            preserveScroll: true,
            onSuccess: () => {
                success(`Organizational unit "${data.name}" has been updated successfully`);
                onClose();
            },
            onError: (errors) => {
                error(Object.values(errors).flat().join('\n'));
            }
        });
    };

    return (
        <Modal show={!!unit} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Organizational Unit</h3>

                {canChangeBranch && (
                    <div>
                        <InputLabel htmlFor="edit-branch" value="Branch" />
                        <select
                            id="edit-branch"
                            value={data.branch_id}
                            onChange={(e) => {
                                setData('branch_id', e.target.value);
                                setData('parent_id', '');
                            }}
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
                    <InputLabel htmlFor="edit-name" value="Name" />
                    <TextInput id="edit-name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-code" value="Code" />
                    <TextInput id="edit-code" className="mt-1 block w-full" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                    <InputError className="mt-2" message={errors.code} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-type" value="Type" />
                    <select
                        id="edit-type"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        {types?.map((type) => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.type} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-parent" value="Parent Unit" />
                    <select
                        id="edit-parent"
                        value={data.parent_id}
                        onChange={(e) => setData('parent_id', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">None (Top Level)</option>
                        {filteredParents.map((parent) => (
                            <option key={parent.id} value={parent.id}>{parent.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.parent_id} />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="edit-active"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <InputLabel htmlFor="edit-active" value="Active" className="m-0" />
                </div>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

// Wrap the component with AdminLayout which provides AlertProvider
export default function Index() {
    return (
        <AdminLayout title="Organizational Units" header="Organizational Units">
            <OrgUnitsIndex />
        </AdminLayout>
    );
}