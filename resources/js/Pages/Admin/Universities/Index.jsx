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
import Checkbox from '@/Components/Checkbox.jsx';

export default function Index() {
    const { props } = usePage();
    const { universities, filters } = props;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('admin.universities.index'), { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const onDelete = (university) => {
        if (confirm(`Archive ${university.name}?`)) {
            router.delete(route('admin.universities.destroy', university.id), {
                preserveScroll: true,
            });
        }
    };

    const openEdit = (university) => {
        setEditing(university);
    };

    const closeEdit = () => setEditing(null);

    return (
        <AdminLayout
            title="Universities"
            header="Universities"
        >
            <Head title="Universities" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Manage Universities</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create and configure parent tenants before adding branches.</p>
                    </div>
                    <PrimaryButton onClick={() => setIsCreateOpen(true)}>New University</PrimaryButton>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="w-full max-w-sm">
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Search by name or code"
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/60">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Domain</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Branches</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-900 dark:bg-gray-900">
                                {universities?.data?.length ? (
                                    universities.data.map((university) => (
                                        <tr key={university.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{university.name}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">{university.code}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{university.domain ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{university.branches_count}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${university.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                                                    {university.is_active ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <div className="flex items-center justify-end gap-2">
                                                    <SecondaryButton onClick={() => openEdit(university)}>Edit</SecondaryButton>
                                                    <DangerButton onClick={() => onDelete(university)} disabled={university.branches_count > 0}>
                                                        Archive
                                                    </DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={6}>
                                            No universities found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {universities?.links && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {universities.links.map((link) => (
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

            <CreateModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <EditModal university={editing} onClose={closeEdit} />
        </AdminLayout>
    );
}

function CreateModal({ open, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        domain: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.universities.store'), {
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create University</h3>

                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="code" value="Code" />
                    <TextInput id="code" className="mt-1 block w-full uppercase" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                    <InputError className="mt-2" message={errors.code} />
                </div>

                <div>
                    <InputLabel htmlFor="domain" value="Domain" />
                    <TextInput id="domain" className="mt-1 block w-full" value={data.domain} onChange={(e) => setData('domain', e.target.value)} placeholder="university.example" />
                    <InputError className="mt-2" message={errors.domain} />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Checkbox checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Create</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function EditModal({ university, onClose }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        domain: '',
        is_active: true,
    });

    useEffect(() => {
        if (university) {
            setData('name', university.name);
            setData('code', university.code);
            setData('domain', university.domain ?? '');
            setData('is_active', university.is_active);
        }
    }, [university]);

    if (!university) {
        return null;
    }

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.universities.update', university.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={!!university} onClose={() => { reset(); onClose(); }}>
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit University</h3>

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

                <div>
                    <InputLabel htmlFor="edit-domain" value="Domain" />
                    <TextInput id="edit-domain" className="mt-1 block w-full" value={data.domain} onChange={(e) => setData('domain', e.target.value)} />
                    <InputError className="mt-2" message={errors.domain} />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Checkbox checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
