import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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

function PermissionSelector({ permissions = [], selected = [], onToggle }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {permissions.map((permission) => (
        <label key={permission.name} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Checkbox
            checked={selected.includes(permission.name)}
            onChange={() => onToggle(permission.name)}
          />
          <span>{permission.name}</span>
        </label>
      ))}
    </div>
  );
}

function RoleModal({ title, form, onSubmit, onClose, isOpen, permissions }) {
  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="lg">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>

        <div>
          <InputLabel htmlFor="role-name" value="Role name" />
          <TextInput
            id="role-name"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            className="mt-1 block w-full"
          />
          {form.errors.name && <p className="mt-1 text-xs text-rose-500">{form.errors.name}</p>}
        </div>

        <div>
          <InputLabel value="Permissions" />
          <PermissionSelector
            permissions={permissions}
            selected={form.data.permissions}
            onToggle={(permission) => {
              if (form.data.permissions.includes(permission)) {
                form.setData('permissions', form.data.permissions.filter((p) => p !== permission));
              } else {
                form.setData('permissions', [...form.data.permissions, permission]);
              }
            }}
          />
          {form.errors.permissions && <p className="mt-1 text-xs text-rose-500">{form.errors.permissions}</p>}
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

function RolesPage() {
  const { props } = usePage();
  const { roles, filters = {}, permissionOptions = [] } = props;
  const { success, error } = useAlerts();

  const [search, setSearch] = useState(filters.search ?? '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const createForm = useForm({
    name: '',
    permissions: [],
  });

  const editForm = useForm({
    name: '',
    permissions: [],
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('admin.roles.index'), {
        search: search || undefined,
      }, {
        preserveState: true,
        replace: true,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  const openCreate = () => {
    createForm.reset();
    createForm.clearErrors();
    setIsCreateOpen(true);
  };

  const openEdit = (role) => {
    editForm.setData({
      name: role.name,
      permissions: role.permissions ?? [],
    });
    editForm.clearErrors();
    setEditingRole(role);
    setIsEditOpen(true);
  };

  const submitCreate = () => {
    createForm.post(route('admin.roles.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setIsCreateOpen(false);
        success('Role created successfully.');
        createForm.reset();
      },
      onError: () => error('Unable to create role.'),
    });
  };

  const submitUpdate = () => {
    if (!editingRole) return;

    editForm.put(route('admin.roles.update', editingRole.id), {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditOpen(false);
        success('Role updated.');
      },
      onError: () => error('Unable to update role.'),
    });
  };

  const handleDelete = (role) => {
    confirmAction({
      message: `Delete ${role.name}?`,
      action: () => {
        router.delete(route('admin.roles.destroy', role.id), {
          preserveScroll: true,
          onSuccess: () => success('Role removed.'),
          onError: () => error('Unable to delete role.'),
        });
      },
    });
  };

  const rolesData = roles?.data ?? [];

  return (
    <>
      <Head title="Roles & Permissions" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Roles & Permissions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Define roles and map permissions for administrators.</p>
          </div>
          <PrimaryButton onClick={openCreate}>New Role</PrimaryButton>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="md:w-64">
            <InputLabel htmlFor="role-search" value="Search" />
            <TextInput
              id="role-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles"
              className="mt-1 block w-full"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/70">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Permissions</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {rolesData.length ? rolesData.map((role) => (
                  <tr key={role.id}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{role.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{role.permissions?.length ? role.permissions.join(', ') : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{role.users_count}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="inline-flex gap-2">
                        <SecondaryButton onClick={() => openEdit(role)}>Edit</SecondaryButton>
                        <DangerButton onClick={() => handleDelete(role)}>Delete</DangerButton>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No roles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {roles?.links && (
            <div className="flex flex-wrap items-center gap-2">
              {roles.links.map((link, index) => (
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

      <RoleModal
        title="Create Role"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        form={createForm}
        onSubmit={submitCreate}
        permissions={permissionOptions}
      />

      <RoleModal
        title="Edit Role"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        form={editForm}
        onSubmit={submitUpdate}
        permissions={permissionOptions}
      />
    </>
  );
}

export default function RolesIndexPage() {
  return (
    <AdminLayout title="Roles & Permissions" header="Roles & Permissions">
      <RolesPage />
    </AdminLayout>
  );
}
