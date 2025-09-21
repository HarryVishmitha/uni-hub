import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';
import DangerButton from '@/Components/DangerButton.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import TextInput from '@/Components/TextInput.jsx';
import Checkbox from '@/Components/Checkbox.jsx';
import Modal from '@/Components/Modal.jsx';
import { useAlerts } from '@/Contexts/AlertContext';
import { confirmAction } from '@/Utils/AlertUtils';

function RoleSelector({ selected = [], onToggle, roles }) {
  return (
    <div className="space-y-2">
      {roles.map((role) => (
        <label key={role.name} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Checkbox
            checked={selected.includes(role.name)}
            onChange={() => onToggle(role.name)}
          />
          <span>{role.name}</span>
        </label>
      ))}
    </div>
  );
}

function UserModal({ title, form, onSubmit, onClose, isOpen, roles, branches, includePassword = true }) {
  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="md">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>

        <div>
          <InputLabel htmlFor="user-name" value="Name" />
          <TextInput
            id="user-name"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            className="mt-1 block w-full"
          />
          {form.errors.name && <p className="mt-1 text-xs text-rose-500">{form.errors.name}</p>}
        </div>

        <div>
          <InputLabel htmlFor="user-email" value="Email" />
          <TextInput
            id="user-email"
            type="email"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            className="mt-1 block w-full"
          />
          {form.errors.email && <p className="mt-1 text-xs text-rose-500">{form.errors.email}</p>}
        </div>

        <div>
          <InputLabel htmlFor="user-branch" value="Branch" />
          <select
            id="user-branch"
            value={form.data.branch_id ?? ''}
            onChange={(e) => form.setData('branch_id', e.target.value || null)}
            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">No branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          {form.errors.branch_id && <p className="mt-1 text-xs text-rose-500">{form.errors.branch_id}</p>}
        </div>

        {includePassword ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputLabel htmlFor="user-password" value="Password" />
              <TextInput
                id="user-password"
                type="password"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
                className="mt-1 block w-full"
              />
              {form.errors.password && <p className="mt-1 text-xs text-rose-500">{form.errors.password}</p>}
            </div>
            <div>
              <InputLabel htmlFor="user-password-confirm" value="Confirm Password" />
              <TextInput
                id="user-password-confirm"
                type="password"
                value={form.data.password_confirmation}
                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                className="mt-1 block w-full"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputLabel htmlFor="user-password" value="Password (optional)" />
              <TextInput
                id="user-password"
                type="password"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
                className="mt-1 block w-full"
              />
              {form.errors.password && <p className="mt-1 text-xs text-rose-500">{form.errors.password}</p>}
            </div>
            <div>
              <InputLabel htmlFor="user-password-confirm" value="Confirm Password" />
              <TextInput
                id="user-password-confirm"
                type="password"
                value={form.data.password_confirmation}
                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                className="mt-1 block w-full"
              />
            </div>
          </div>
        )}

        <div>
          <InputLabel value="Roles" />
          <RoleSelector
            roles={roles}
            selected={form.data.roles}
            onToggle={(role) => {
              if (form.data.roles.includes(role)) {
                form.setData('roles', form.data.roles.filter((r) => r !== role));
              } else {
                form.setData('roles', [...form.data.roles, role]);
              }
            }}
          />
          {form.errors.roles && <p className="mt-1 text-xs text-rose-500">{form.errors.roles}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={form.processing}>
            {form.processing ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function UsersPage() {
  const { props } = usePage();
  const { users, filters = {}, roleOptions = [], branchOptions = [] } = props;
  const { success, error } = useAlerts();

  const [search, setSearch] = useState(filters.search ?? '');
  const [branchId, setBranchId] = useState(filters.branch_id ?? '');
  const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const createForm = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    branch_id: null,
    roles: [],
  });

  const editForm = useForm({
    name: '',
    email: '',
    branch_id: null,
    roles: [],
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('admin.users.index'), {
        search: search || undefined,
        branch_id: branchId || undefined,
        role: roleFilter || undefined,
      }, {
        preserveState: true,
        replace: true,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, branchId, roleFilter]);

  const openCreate = () => {
    createForm.reset();
    createForm.clearErrors();
    setIsCreateOpen(true);
  };

  const openEdit = (user) => {
    editForm.setData({
      name: user.name,
      email: user.email,
      branch_id: user.branch_id ?? null,
      roles: user.roles ?? [],
      password: '',
      password_confirmation: '',
    });
    editForm.clearErrors();
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const submitCreate = () => {
    createForm.post(route('admin.users.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setIsCreateOpen(false);
        success('User account created.');
        createForm.reset();
      },
      onError: () => error('Unable to create user account.'),
    });
  };

  const submitUpdate = () => {
    if (!editingUser) return;

    editForm.put(route('admin.users.update', editingUser.id), {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditOpen(false);
        success('User account updated.');
      },
      onError: () => error('Unable to update user account.'),
    });
  };

  const handleDelete = (user) => {
    confirmAction({
      message: `Remove ${user.name}?`,
      action: () => {
        router.delete(route('admin.users.destroy', user.id), {
          preserveScroll: true,
          onSuccess: () => success('User removed.'),
          onError: () => error('Unable to remove user.'),
        });
      },
    });
  };

  const usersData = useMemo(() => users?.data ?? [], [users]);

  return (
    <>
      <Head title="User Accounts" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Accounts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage administrators, staff, and student access.</p>
          </div>
          <PrimaryButton onClick={openCreate}>New User</PrimaryButton>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <InputLabel htmlFor="user-search" value="Search" />
              <TextInput
                id="user-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or email"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <InputLabel htmlFor="user-branch-filter" value="Branch" />
              <select
                id="user-branch-filter"
                value={branchId || ''}
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
              <InputLabel htmlFor="user-role-filter" value="Role" />
              <select
                id="user-role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All roles</option>
                {roleOptions.map((role) => (
                  <option key={role.name} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/70">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {usersData.length ? usersData.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{user.branch ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {user.roles && user.roles.length ? user.roles.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="inline-flex gap-2">
                        <SecondaryButton onClick={() => openEdit(user)}>Edit</SecondaryButton>
                        <DangerButton onClick={() => handleDelete(user)}>Delete</DangerButton>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {users?.links && (
            <div className="flex flex-wrap items-center gap-2">
              {users.links.map((link, index) => (
                <button
                  key={index}
                  disabled={link.url === null}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                  className={`rounded-lg px-3 py-1 text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} disabled:opacity-40 disabled:cursor-not-allowed`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <UserModal
        title="Create User"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        form={createForm}
        onSubmit={submitCreate}
        roles={roleOptions}
        branches={branchOptions}
        includePassword
      />

      <UserModal
        title="Edit User"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        form={editForm}
        onSubmit={submitUpdate}
        roles={roleOptions}
        branches={branchOptions}
        includePassword={false}
      />
    </>
  );
}

export default function UsersIndexPage() {
  return (
    <AdminLayout title="User Accounts" header="User Accounts">
      <UsersPage />
    </AdminLayout>
  );
}
