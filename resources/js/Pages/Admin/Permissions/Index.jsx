import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import PrimaryButton from '@/Components/PrimaryButton.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';
import DangerButton from '@/Components/DangerButton.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import TextInput from '@/Components/TextInput.jsx';
import Modal from '@/Components/Modal.jsx';
import { useAlerts } from '@/Contexts/AlertContext';
import { confirmAction } from '@/Utils/AlertUtils';

function PermissionModal({ title, form, onSubmit, onClose, isOpen }) {
  return (
    <Modal show={isOpen} onClose={onClose} maxWidth="sm">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <div>
          <InputLabel htmlFor="permission-name" value="Permission name" />
          <TextInput
            id="permission-name"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            className="mt-1 block w-full"
          />
          {form.errors.name && <p className="mt-1 text-xs text-rose-500">{form.errors.name}</p>}
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

function PermissionsPage() {
  const { props } = usePage();
  const { permissions, filters = {} } = props;
  const { success, error } = useAlerts();

  const [search, setSearch] = useState(filters.search ?? '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);

  const createForm = useForm({ name: '' });
  const editForm = useForm({ name: '' });

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('admin.permissions.index'), {
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

  const openEdit = (permission) => {
    editForm.setData({ name: permission.name });
    editForm.clearErrors();
    setEditingPermission(permission);
    setIsEditOpen(true);
  };

  const submitCreate = () => {
    createForm.post(route('admin.permissions.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setIsCreateOpen(false);
        success('Permission created.');
        createForm.reset();
      },
      onError: () => error('Unable to create permission.'),
    });
  };

  const submitUpdate = () => {
    if (!editingPermission) return;

    editForm.put(route('admin.permissions.update', editingPermission.id), {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditOpen(false);
        success('Permission updated.');
      },
      onError: () => error('Unable to update permission.'),
    });
  };

  const handleDelete = (permission) => {
    confirmAction({
      message: `Delete ${permission.name}?`,
      action: () => {
        router.delete(route('admin.permissions.destroy', permission.id), {
          preserveScroll: true,
          onSuccess: () => success('Permission removed.'),
          onError: () => error('Unable to delete permission.'),
        });
      },
    });
  };

  const permissionData = permissions?.data ?? [];

  return (
    <>
      <Head title="Permissions" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Permissions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage individual permissions for system roles.</p>
          </div>
          <PrimaryButton onClick={openCreate}>New Permission</PrimaryButton>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="md:w-64">
            <InputLabel htmlFor="permission-search" value="Search" />
            <TextInput
              id="permission-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions"
              className="mt-1 block w-full"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/70">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Guard</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {permissionData.length ? permissionData.map((permission) => (
                  <tr key={permission.id}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{permission.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{permission.guard_name}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="inline-flex gap-2">
                        <SecondaryButton onClick={() => openEdit(permission)}>Edit</SecondaryButton>
                        <DangerButton onClick={() => handleDelete(permission)}>Delete</DangerButton>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No permissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {permissions?.links && (
            <div className="flex flex-wrap items-center gap-2">
              {permissions.links.map((link, index) => (
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

      <PermissionModal
        title="Create Permission"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        form={createForm}
        onSubmit={submitCreate}
      />

      <PermissionModal
        title="Edit Permission"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        form={editForm}
        onSubmit={submitUpdate}
      />
    </>
  );
}

export default function PermissionsIndexPage() {
  return (
    <AdminLayout title="Permissions" header="Permissions">
      <PermissionsPage />
    </AdminLayout>
  );
}
