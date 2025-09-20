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
    const { branches, universities, filters, auth } = props;
    const roles = auth?.user?.roles ?? [];
    const canCreate = roles.includes('super_admin');

    const [search, setSearch] = useState(filters?.search ?? '');
    const [universityId, setUniversityId] = useState(filters?.university_id ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('admin.branches.index'), { search, university_id: universityId }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, universityId]);

    const onDelete = (branch) => {
        if (confirm(`Archive ${branch.name}?`)) {
            router.delete(route('admin.branches.destroy', branch.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Branches" header="Branches">
            <Head title="Branches" />

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Branch Directory</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Each branch holds its own theme, settings, and organizational tree.</p>
                    </div>
                    {canCreate && <PrimaryButton onClick={() => setIsCreateOpen(true)}>New Branch</PrimaryButton>}
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 flex flex-wrap items-end gap-4">
                        <div className="w-full max-w-sm">
                            <InputLabel htmlFor="branch-search" value="Search" />
                            <TextInput id="branch-search" className="mt-1 block w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, code, or city" />
                        </div>
                        {canCreate && (
                            <div className="w-full max-w-xs">
                                <InputLabel htmlFor="filter-university" value="University" />
                                <select
                                    id="filter-university"
                                    value={universityId ?? ''}
                                    onChange={(e) => setUniversityId(e.target.value || '')}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                    <option value="">All Universities</option>
                                    {universities?.map((uni) => (
                                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/60">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Branch</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Timezone</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Org Units</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Programs</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-900 dark:bg-gray-900">
                                {branches?.data?.length ? branches.data.map((branch) => (
                                    <tr key={branch.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            <div className="font-medium">{branch.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{branch.code} · {branch.university.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {branch.city ? `${branch.city}, ${branch.country ?? ''}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{branch.timezone}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{branch.org_units_count}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{branch.programs_count}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${branch.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                                                {branch.is_active ? 'Active' : 'Archived'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <SecondaryButton onClick={() => setEditing(branch)}>Configure</SecondaryButton>
                                                {roles.includes('super_admin') && (
                                                    <DangerButton onClick={() => onDelete(branch)} disabled={branch.org_units_count > 0 || branch.programs_count > 0}>
                                                        Archive
                                                    </DangerButton>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={7}>No branches available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {branches?.links && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {branches.links.map((link) => (
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

            {canCreate && (
                <CreateModal
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    universities={universities}
                />
            )}

            <EditModal
                branch={editing}
                universities={universities}
                canChangeUniversity={roles.includes('super_admin')}
                onClose={() => setEditing(null)}
            />
        </AdminLayout>
    );
}

function CreateModal({ open, onClose, universities }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        university_id: universities?.[0]?.id ?? '',
        name: '',
        code: '',
        country: '',
        city: '',
        timezone: 'UTC',
        theme_tokens: {},
        feature_flags: {},
        is_active: true,
    });
    const [themeTokensText, setThemeTokensText] = useState('{}');
    const [featureFlagsText, setFeatureFlagsText] = useState('{}');
    const [localErrors, setLocalErrors] = useState({ theme_tokens: null, feature_flags: null });

    useEffect(() => {
        if (!open) {
            setThemeTokensText('{}');
            setFeatureFlagsText('{}');
            setLocalErrors({ theme_tokens: null, feature_flags: null });
        }
    }, [open]);

    const submit = (e) => {
        e.preventDefault();

        let themeTokens = {};
        let featureFlags = {};

        try {
            themeTokens = themeTokensText.trim() ? JSON.parse(themeTokensText) : {};
            setLocalErrors((prev) => ({ ...prev, theme_tokens: null }));
        } catch (error) {
            setLocalErrors((prev) => ({ ...prev, theme_tokens: 'Invalid JSON' }));
            return;
        }

        try {
            featureFlags = featureFlagsText.trim() ? JSON.parse(featureFlagsText) : {};
            setLocalErrors((prev) => ({ ...prev, feature_flags: null }));
        } catch (error) {
            setLocalErrors((prev) => ({ ...prev, feature_flags: 'Invalid JSON' }));
            return;
        }

        transform((formData) => ({
            ...formData,
            theme_tokens: themeTokens,
            feature_flags: featureFlags,
        }));

        post(route('admin.branches.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setThemeTokensText('{}');
                setFeatureFlagsText('{}');
                onClose();
            },
        });
    };

    return (
        <Modal show={open} onClose={() => { reset(); onClose(); }} maxWidth="xl">
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Branch</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="branch-university" value="University" />
                        <select
                            id="branch-university"
                            value={data.university_id}
                            onChange={(e) => setData('university_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            {universities?.map((uni) => (
                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.university_id} />
                    </div>
                    <div>
                        <InputLabel htmlFor="branch-code" value="Code" />
                        <TextInput id="branch-code" className="mt-1 block w-full uppercase" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                        <InputError className="mt-2" message={errors.code} />
                    </div>
                    <div>
                        <InputLabel htmlFor="branch-name" value="Name" />
                        <TextInput id="branch-name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError className="mt-2" message={errors.name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="branch-timezone" value="Timezone" />
                        <TextInput id="branch-timezone" className="mt-1 block w-full" value={data.timezone} onChange={(e) => setData('timezone', e.target.value)} required />
                        <InputError className="mt-2" message={errors.timezone} />
                    </div>
                    <div>
                        <InputLabel htmlFor="branch-country" value="Country" />
                        <TextInput id="branch-country" className="mt-1 block w-full" value={data.country} onChange={(e) => setData('country', e.target.value)} />
                        <InputError className="mt-2" message={errors.country} />
                    </div>
                    <div>
                        <InputLabel htmlFor="branch-city" value="City" />
                        <TextInput id="branch-city" className="mt-1 block w-full" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                        <InputError className="mt-2" message={errors.city} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="branch-theme" value="Theme Tokens (JSON)" />
                    <textarea
                        id="branch-theme"
                        value={themeTokensText}
                        onChange={(e) => setThemeTokensText(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        rows={3}
                    />
                    <InputError className="mt-2" message={localErrors.theme_tokens || errors.theme_tokens} />
                </div>

                <div>
                    <InputLabel htmlFor="branch-features" value="Feature Flags (JSON)" />
                    <textarea
                        id="branch-features"
                        value={featureFlagsText}
                        onChange={(e) => setFeatureFlagsText(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        rows={3}
                    />
                    <InputError className="mt-2" message={localErrors.feature_flags || errors.feature_flags} />
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

function EditModal({ branch, universities, canChangeUniversity, onClose }) {
    const { data, setData, put, processing, errors, reset, transform } = useForm({
        university_id: '',
        name: '',
        code: '',
        country: '',
        city: '',
        timezone: '',
        theme_tokens: {},
        feature_flags: {},
        is_active: true,
    });
    const [themeTokensText, setThemeTokensText] = useState('{}');
    const [featureFlagsText, setFeatureFlagsText] = useState('{}');
    const [localErrors, setLocalErrors] = useState({ theme_tokens: null, feature_flags: null });

    useEffect(() => {
        if (branch) {
            setData('university_id', branch.university.id);
            setData('name', branch.name);
            setData('code', branch.code);
            setData('country', branch.country ?? '');
            setData('city', branch.city ?? '');
            setData('timezone', branch.timezone);
            setData('is_active', branch.is_active);
            setThemeTokensText(JSON.stringify(branch.theme_tokens ?? {}, null, 2));
            setFeatureFlagsText(JSON.stringify(branch.feature_flags ?? {}, null, 2));
        }
    }, [branch]);

    if (!branch) {
        return null;
    }

    const submit = (e) => {
        e.preventDefault();

        let themeTokens = {};
        let featureFlags = {};

        try {
            themeTokens = themeTokensText.trim() ? JSON.parse(themeTokensText) : {};
            setLocalErrors((prev) => ({ ...prev, theme_tokens: null }));
        } catch (error) {
            setLocalErrors((prev) => ({ ...prev, theme_tokens: 'Invalid JSON' }));
            return;
        }

        try {
            featureFlags = featureFlagsText.trim() ? JSON.parse(featureFlagsText) : {};
            setLocalErrors((prev) => ({ ...prev, feature_flags: null }));
        } catch (error) {
            setLocalErrors((prev) => ({ ...prev, feature_flags: 'Invalid JSON' }));
            return;
        }

        transform((formData) => ({
            ...formData,
            theme_tokens: themeTokens,
            feature_flags: featureFlags,
        }));

        put(route('admin.branches.update', branch.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={!!branch} onClose={() => { reset(); onClose(); }} maxWidth="xl">
            <form onSubmit={submit} className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configure Branch</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    {canChangeUniversity && (
                        <div>
                            <InputLabel htmlFor="edit-university" value="University" />
                            <select
                                id="edit-university"
                                value={data.university_id}
                                onChange={(e) => setData('university_id', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            >
                                {universities?.map((uni) => (
                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                ))}
                            </select>
                            <InputError className="mt-2" message={errors.university_id} />
                        </div>
                    )}
                    <div>
                        <InputLabel htmlFor="edit-code" value="Code" />
                        <TextInput id="edit-code" className="mt-1 block w-full uppercase" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                        <InputError className="mt-2" message={errors.code} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-name" value="Name" />
                        <TextInput id="edit-name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError className="mt-2" message={errors.name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-timezone" value="Timezone" />
                        <TextInput id="edit-timezone" className="mt-1 block w-full" value={data.timezone} onChange={(e) => setData('timezone', e.target.value)} required />
                        <InputError className="mt-2" message={errors.timezone} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-country" value="Country" />
                        <TextInput id="edit-country" className="mt-1 block w-full" value={data.country} onChange={(e) => setData('country', e.target.value)} />
                        <InputError className="mt-2" message={errors.country} />
                    </div>
                    <div>
                        <InputLabel htmlFor="edit-city" value="City" />
                        <TextInput id="edit-city" className="mt-1 block w-full" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                        <InputError className="mt-2" message={errors.city} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="edit-theme" value="Theme Tokens (JSON)" />
                    <textarea
                        id="edit-theme"
                        value={themeTokensText}
                        onChange={(e) => setThemeTokensText(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        rows={3}
                    />
                    <InputError className="mt-2" message={localErrors.theme_tokens || errors.theme_tokens} />
                </div>

                <div>
                    <InputLabel htmlFor="edit-features" value="Feature Flags (JSON)" />
                    <textarea
                        id="edit-features"
                        value={featureFlagsText}
                        onChange={(e) => setFeatureFlagsText(e.target.value)}
                        className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        rows={3}
                    />
                    <InputError className="mt-2" message={localErrors.feature_flags || errors.feature_flags} />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Checkbox checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>

                <div className="flex justify-end gap-2">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Close</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>Save</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
