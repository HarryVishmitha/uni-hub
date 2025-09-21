import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
function ProgramsIndex() {
    const { props } = usePage();
    const { programs, branches, orgUnits, filters, auth } = props;
    const roles = auth?.roles ?? [];
    const isSuperAdmin = roles.includes('super_admin');
    const { success, error, warning, info } = useAlerts();

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
        confirmAction({
            message: `Are you sure you want to archive ${program.title}?`,
            action: () => {
                router.delete(route('admin.programs.destroy', program.id), { 
                    preserveScroll: true,
                    onSuccess: () => success(`Program "${program.title}" has been archived successfully`),
                    onError: (errors) => error(errors?.message || 'Failed to archive program')
                });
            }
        });
    };

    return (
        <>
            <Head title="Programs" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Academic Programs</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage degree programs and certificates offered by your institution.</p>
                    </div>
                    <PrimaryButton onClick={() => setIsCreateOpen(true)}>New Program</PrimaryButton>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="program-search" value="Search" />
                            <TextInput id="program-search" className="mt-1 block w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Program title or code" />
                        </div>
                        <div>
                            <InputLabel htmlFor="program-branch" value="Branch" />
                            <select
                                id="program-branch"
                                value={branchFilter}
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
                        <div>
                            <InputLabel htmlFor="program-orgunit" value="Organizational Unit" />
                            <select
                                id="program-orgunit"
                                value={orgUnitFilter}
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Modality</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                {programs?.data?.length ? (
                                    programs.data.map((program) => (
                                        <tr key={program.id}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{program.title}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{program.org_unit?.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{program.branch?.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{program.level ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{program.modality ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-500/10 dark:text-slate-300">
                                                    {program.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.programs.enrollments.index', program.id)}>
                                                        <SecondaryButton>Enrollments</SecondaryButton>
                                                    </Link>
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
            />

            <EditModal
                program={editing}
                onClose={() => setEditing(null)}
                branches={branches}
                orgUnits={orgUnits}
            />
        </>
    );
}

function CreateModal({ open, onClose, branches, orgUnits }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        branch_id: branches?.[0]?.id ?? '',
        org_unit_id: '',
        title: '',
        code: '',
        degree_level: 'bachelor',
        length_years: 4,
        min_credits: 120,
        meta: {},
        is_active: true,
    });
    const { success, error } = useAlerts();
    const [metaText, setMetaText] = useState('{}');
    const [metaError, setMetaError] = useState(null);

    const branchOrgUnits = useMemo(() => {
        return orgUnits?.filter((unit) => unit.branch_id === Number(data.branch_id)) ?? [];
    }, [orgUnits, data.branch_id]);

    useEffect(() => {
        if (branchOrgUnits.length > 0 && !branchOrgUnits.some((unit) => unit.id === Number(data.org_unit_id))) {
            setData('org_unit_id', branchOrgUnits[0].id);
        }
    }, [branchOrgUnits, data.org_unit_id]);

    useEffect(() => {
        if (!open) {
            reset({
                branch_id: branches?.[0]?.id ?? '',
                org_unit_id: '',
                title: '',
                code: '',
                degree_level: 'bachelor',
                length_years: 4,
                min_credits: 120,
                meta: {},
                is_active: true,
            });
            setMetaText('{}');
            setMetaError(null);
        }
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        
        let metaObj = {};
        try {
            if (metaText.trim()) {
                metaObj = JSON.parse(metaText);
            }
            setMetaError(null);
        } catch (error) {
            setMetaError('Invalid JSON format');
            return;
        }

        transform((formData) => ({
            ...formData,
            meta: metaObj,
        }));

        post(route('admin.programs.store'), {
            preserveScroll: true,
            onSuccess: () => {
                success(`Program "${data.title}" has been created successfully`);
                reset();
                setMetaText('{}');
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Program</h3>

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

                <div>
                    <InputLabel htmlFor="create-orgunit" value="Department/School" />
                    <select
                        id="create-orgunit"
                        value={data.org_unit_id}
                        onChange={(e) => setData('org_unit_id', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">Select a department</option>
                        {branchOrgUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.org_unit_id} />
                </div>

                <div>
                    <InputLabel htmlFor="create-title" value="Program Title" />
                    <TextInput id="create-title" className="mt-1 block w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                    <InputError className="mt-2" message={errors.title} />
                </div>

                <div>
                    <InputLabel htmlFor="create-code" value="Program Code" />
                    <TextInput id="create-code" className="mt-1 block w-full" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                    <InputError className="mt-2" message={errors.code} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="create-level" value="Degree Level" />
                        <select
                            id="create-level"
                            value={data.degree_level}
                            onChange={(e) => setData('degree_level', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="certificate">Certificate</option>
                            <option value="associate">Associate</option>
                            <option value="bachelor">Bachelor</option>
                            <option value="master">Master</option>
                            <option value="doctorate">Doctorate</option>
                        </select>
                        <InputError className="mt-2" message={errors.degree_level} />
                    </div>
                    <div>
                        <InputLabel htmlFor="create-years" value="Length (Years)" />
                        <TextInput type="number" min="1" id="create-years" className="mt-1 block w-full" value={data.length_years} onChange={(e) => setData('length_years', e.target.value)} required />
                        <InputError className="mt-2" message={errors.length_years} />
                    </div>
                    <div>
                        <InputLabel htmlFor="create-credits" value="Min Credits" />
                        <TextInput type="number" min="0" id="create-credits" className="mt-1 block w-full" value={data.min_credits} onChange={(e) => setData('min_credits', e.target.value)} required />
                        <InputError className="mt-2" message={errors.min_credits} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="create-meta" value="Metadata (JSON)" />
                    <textarea
                        id="create-meta"
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        value={metaText}
                        onChange={(e) => setMetaText(e.target.value)}
                        rows={3}
                    />
                    <InputError className="mt-2" message={metaError || errors.meta} />
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

function EditModal({ program, onClose, branches, orgUnits }) {
    const { data, setData, put, processing, errors, reset, transform } = useForm({
        branch_id: '',
        org_unit_id: '',
        title: '',
        code: '',
        degree_level: '',
        length_years: '',
        min_credits: '',
        meta: {},
        is_active: true,
    });
    const { success, error } = useAlerts();
    const [metaText, setMetaText] = useState('{}');
    const [metaError, setMetaError] = useState(null);

    useEffect(() => {
        if (program) {
            setData({
                branch_id: program.branch_id,
                org_unit_id: program.org_unit_id,
                title: program.title,
                code: program.code,
                degree_level: program.degree_level,
                length_years: program.length_years,
                min_credits: program.min_credits,
                meta: program.meta,
                is_active: program.is_active,
            });
            setMetaText(JSON.stringify(program.meta ?? {}, null, 2));
        }
    }, [program]);

    const branchOrgUnits = useMemo(() => {
        return orgUnits?.filter((unit) => unit.branch_id === Number(data.branch_id)) ?? [];
    }, [orgUnits, data.branch_id]);

    if (!program) {
        return null;
    }

    const submit = (e) => {
        e.preventDefault();
        
        let metaObj = {};
        try {
            if (metaText.trim()) {
                metaObj = JSON.parse(metaText);
            }
            setMetaError(null);
        } catch (error) {
            setMetaError('Invalid JSON format');
            return;
        }

        transform((formData) => ({
            ...formData,
            meta: metaObj,
        }));

        put(route('admin.programs.update', program.id), {
            preserveScroll: true,
            onSuccess: () => {
                success(`Program "${data.title}" has been updated successfully`);
                onClose();
            },
            onError: (errors) => {
                error(Object.values(errors).flat().join('\n'));
            }
        });
    };

    return (
        <Modal show={!!program} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Program</h3>

                <div>
                    <InputLabel htmlFor="edit-branch" value="Branch" />
                    <select
                        id="edit-branch"
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

                <div>
                    <InputLabel htmlFor="edit-orgunit" value="Department/School" />
                    <select
                        id="edit-orgunit"
                        value={data.org_unit_id}
                        onChange={(e) => setData('org_unit_id', e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">Select a department</option>
                        {branchOrgUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.org_unit_id} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-title" value="Program Title" />
                    <TextInput id="edit-title" className="mt-1 block w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                    <InputError className="mt-2" message={errors.title} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-code" value="Program Code" />
                    <TextInput id="edit-code" className="mt-1 block w-full" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                    <InputError className="mt-2" message={errors.code} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="edit-level" value="Degree Level" />
                        <select
                            id="edit-level"
                            value={data.degree_level}
                            onChange={(e) => setData('degree_level', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="certificate">Certificate</option>
                            <option value="associate">Associate</option>
                            <option value="bachelor">Bachelor</option>
                            <option value="master">Master</option>
                            <option value="doctorate">Doctorate</option>
                        </select>
                        <InputError className="mt-2" message={errors.degree_level} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-years" value="Length (Years)" />
                        <TextInput type="number" min="1" id="edit-years" className="mt-1 block w-full" value={data.length_years} onChange={(e) => setData('length_years', e.target.value)} required />
                        <InputError className="mt-2" message={errors.length_years} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-credits" value="Min Credits" />
                        <TextInput type="number" min="0" id="edit-credits" className="mt-1 block w-full" value={data.min_credits} onChange={(e) => setData('min_credits', e.target.value)} required />
                        <InputError className="mt-2" message={errors.min_credits} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="edit-meta" value="Metadata (JSON)" />
                    <textarea
                        id="edit-meta"
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        value={metaText}
                        onChange={(e) => setMetaText(e.target.value)}
                        rows={3}
                    />
                    <InputError className="mt-2" message={metaError || errors.meta} />
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
        <AdminLayout title="Programs" header="Programs">
            <ProgramsIndex />
        </AdminLayout>
    );
}
