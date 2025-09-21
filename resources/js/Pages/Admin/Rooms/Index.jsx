import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import Modal from '@/Components/Modal';
import { useAlerts } from '@/Contexts/AlertContext';

function RoomsIndex() {
  const { props } = usePage();
  const { rooms, filters = {}, branchOptions = [] } = props;
  const { success, error } = useAlerts();
  const authBranchId = props?.auth?.user?.branch_id ?? '';

  const [search, setSearch] = useState(filters?.search ?? '');
  const [building, setBuilding] = useState(filters?.building ?? '');
  const [status, setStatus] = useState(filters?.status ?? '');
  const [branchId, setBranchId] = useState(filters?.branch_id ?? (props?.auth?.user?.is_super ? '' : authBranchId));

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const createForm = useForm({
    branch_id: branchId || authBranchId || '',
    building: '',
    room_no: '',
    name: '',
    seats: '',
    equipment_input: '',
    is_active: true,
  });

  const editForm = useForm({
    branch_id: '',
    building: '',
    room_no: '',
    name: '',
    seats: '',
    equipment_input: '',
    is_active: true,
  });

  const parseEquipment = (value) => {
    if (!value) return [];
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('admin.rooms.index'), {
        search,
        building,
        status,
        branch_id: branchId || undefined,
      }, {
        preserveState: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, building, status, branchId]);

  useEffect(() => {
    if (editing) {
      editForm.setData({
        branch_id: editing.branch_id || branchId || authBranchId || '',
        building: editing.building || '',
        room_no: editing.room_no || '',
        name: editing.name || '',
        seats: editing.seats ?? '',
        equipment_input: (editing.equipment || []).join(', '),
        is_active: !!editing.is_active,
      });
    }
  }, [editing]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    createForm.transform((data) => ({
      branch_id: data.branch_id || branchId || authBranchId,
      building: data.building,
      room_no: data.room_no,
      name: data.name,
      seats: Number(data.seats ?? 0),
      equipment: parseEquipment(data.equipment_input),
      is_active: data.is_active,
    }));

    createForm.post(route('admin.rooms.store'), {
        onSuccess: () => {
          success('Room created successfully');
          setIsCreateOpen(false);
          createForm.reset();
          createForm.setData('equipment_input', '');
        },
        onError: (errors) => {
          error(Object.values(errors).flat().join('\n') || 'Failed to create room');
        },
        preserveScroll: true,
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editing) return;

    editForm.transform((data) => ({
      branch_id: data.branch_id || editing.branch_id,
      building: data.building,
      room_no: data.room_no,
      name: data.name,
      seats: Number(data.seats ?? 0),
      equipment: parseEquipment(data.equipment_input),
      is_active: data.is_active,
    }));

    editForm.put(route('admin.rooms.update', editing.id), {
        onSuccess: () => {
          success('Room updated successfully');
          setEditing(null);
          editForm.reset();
          editForm.setData('equipment_input', '');
        },
        onError: (errors) => {
          error(Object.values(errors).flat().join('\n') || 'Failed to update room');
        },
        preserveScroll: true,
      });
  };

  const confirmDelete = (room) => {
    setRoomToDelete(room);
    setConfirmingDeletion(true);
  };

  const deleteRoom = () => {
    if (!roomToDelete) return;
    router.delete(route('admin.rooms.destroy', roomToDelete.id), {
      preserveScroll: true,
      onSuccess: () => {
        success('Room deleted successfully');
        setConfirmingDeletion(false);
        setRoomToDelete(null);
      },
      onError: (errors) => {
        error(Object.values(errors).flat().join('\n') || 'Failed to delete room');
      },
    });
  };

  const statusOptions = useMemo(() => ([
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]), []);

  const renderEquipment = (items = []) => {
    if (!items.length) return <span className="text-gray-400">—</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head title="Rooms" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Rooms</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage teaching spaces, capacity, and equipment.</p>
          </div>
          <PrimaryButton onClick={() => { createForm.reset(); createForm.setData('equipment_input', ''); setIsCreateOpen(true); }}>
            New Room
          </PrimaryButton>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <InputLabel htmlFor="room-search" value="Search" />
              <TextInput
                id="room-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1 block w-full"
                placeholder="Search by room number or name"
              />
            </div>
            <div>
              <InputLabel htmlFor="room-building" value="Building" />
              <TextInput
                id="room-building"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="mt-1 block w-full"
                placeholder="Filter by building"
              />
            </div>
            <div>
              <InputLabel htmlFor="room-status" value="Status" />
              <select
                id="room-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {branchOptions && branchOptions.length > 0 && (
              <div>
                <InputLabel htmlFor="room-branch" value="Branch" />
                <select
                  id="room-branch"
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
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  <th className="px-4 py-3">Building</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rooms?.data?.length ? rooms.data.map((room) => (
                  <tr key={room.id} className="text-gray-900 dark:text-gray-100">
                    <td className="px-4 py-3 text-sm">{room.building}</td>
                    <td className="px-4 py-3 font-medium">{room.room_no}</td>
                    <td className="px-4 py-3 text-sm">{room.name || '—'}</td>
                    <td className="px-4 py-3 text-sm">{room.seats}</td>
                    <td className="px-4 py-3 text-sm">{renderEquipment(room.equipment)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${room.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>
                        {room.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <SecondaryButton onClick={() => setEditing(room)}>Edit</SecondaryButton>
                        <DangerButton onClick={() => confirmDelete(room)}>Delete</DangerButton>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={7}>No rooms found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {rooms?.links && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {rooms.links.map((link) => (
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

      <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="lg">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Create Room</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {branchOptions && branchOptions.length > 0 && (
              <div>
                <InputLabel htmlFor="create-branch" value="Branch" />
                <select
                  id="create-branch"
                  value={createForm.data.branch_id || ''}
                  onChange={(e) => createForm.setData('branch_id', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="" disabled>Select branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                <InputError message={createForm.errors.branch_id} className="mt-2" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <InputLabel htmlFor="create-building" value="Building" />
                <TextInput
                  id="create-building"
                  value={createForm.data.building}
                  onChange={(e) => createForm.setData('building', e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
                <InputError message={createForm.errors.building} className="mt-2" />
              </div>
              <div>
                <InputLabel htmlFor="create-room-no" value="Room Number" />
                <TextInput
                  id="create-room-no"
                  value={createForm.data.room_no}
                  onChange={(e) => createForm.setData('room_no', e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
                <InputError message={createForm.errors.room_no} className="mt-2" />
              </div>
            </div>

            <div>
              <InputLabel htmlFor="create-name" value="Room Name" />
              <TextInput
                id="create-name"
                value={createForm.data.name}
                onChange={(e) => createForm.setData('name', e.target.value)}
                className="mt-1 block w-full"
                placeholder="Optional descriptive name"
              />
              <InputError message={createForm.errors.name} className="mt-2" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <InputLabel htmlFor="create-seats" value="Seats" />
                <TextInput
                  id="create-seats"
                  type="number"
                  min="0"
                  value={createForm.data.seats}
                  onChange={(e) => createForm.setData('seats', e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
                <InputError message={createForm.errors.seats} className="mt-2" />
              </div>
              <div className="flex items-center justify-start gap-3 pt-6">
                <Checkbox
                  id="create-active"
                  checked={createForm.data.is_active}
                  onChange={(e) => createForm.setData('is_active', e.target.checked)}
                />
                <InputLabel htmlFor="create-active" value="Active" />
              </div>
            </div>

            <div>
              <InputLabel htmlFor="create-equipment" value="Equipment (comma separated)" />
              <TextInput
                id="create-equipment"
                value={createForm.data.equipment_input}
                onChange={(e) => createForm.setData('equipment_input', e.target.value)}
                className="mt-1 block w-full"
                placeholder="Projector, Whiteboard, Lab PCs"
              />
              <InputError message={createForm.errors.equipment} className="mt-2" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <SecondaryButton type="button" onClick={() => setIsCreateOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={createForm.processing}>Save</PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>

      <Modal show={!!editing} onClose={() => setEditing(null)} maxWidth="lg">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Room</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {branchOptions && branchOptions.length > 0 && (
              <div>
                <InputLabel htmlFor="edit-branch" value="Branch" />
                <select
                  id="edit-branch"
                  value={editForm.data.branch_id || ''}
                  onChange={(e) => editForm.setData('branch_id', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="" disabled>Select branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                <InputError message={editForm.errors.branch_id} className="mt-2" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <InputLabel htmlFor="edit-building" value="Building" />
                <TextInput
                  id="edit-building"
                  value={editForm.data.building}
                  onChange={(e) => editForm.setData('building', e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
                <InputError message={editForm.errors.building} className="mt-2" />
              </div>
              <div>
                <InputLabel htmlFor="edit-room-no" value="Room Number" />
                <TextInput
                  id="edit-room-no"
                  value={editForm.data.room_no}
                  onChange={(e) => editForm.setData('room_no', e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
                <InputError message={editForm.errors.room_no} className="mt-2" />
              </div>
            </div>

            <div>
              <InputLabel htmlFor="edit-name" value="Room Name" />
              <TextInput
                id="edit-name"
                value={editForm.data.name}
                onChange={(e) => editForm.setData('name', e.target.value)}
                className="mt-1 block w-full"
              />
              <InputError message={editForm.errors.name} className="mt-2" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <InputLabel htmlFor="edit-seats" value="Seats" />
                <TextInput
                  id="edit-seats"
                  type="number"
                  min="0"
                  value={editForm.data.seats}
                  onChange={(e) => editForm.setData('seats', e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
                <InputError message={editForm.errors.seats} className="mt-2" />
              </div>
              <div className="flex items-center justify-start gap-3 pt-6">
                <Checkbox
                  id="edit-active"
                  checked={editForm.data.is_active}
                  onChange={(e) => editForm.setData('is_active', e.target.checked)}
                />
                <InputLabel htmlFor="edit-active" value="Active" />
              </div>
            </div>

            <div>
              <InputLabel htmlFor="edit-equipment" value="Equipment (comma separated)" />
              <TextInput
                id="edit-equipment"
                value={editForm.data.equipment_input}
                onChange={(e) => editForm.setData('equipment_input', e.target.value)}
                className="mt-1 block w-full"
              />
              <InputError message={editForm.errors.equipment} className="mt-2" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <SecondaryButton type="button" onClick={() => setEditing(null)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={editForm.processing}>Save Changes</PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>

      <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)} maxWidth="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Room</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete room {roomToDelete?.room_no}? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={() => setConfirmingDeletion(false)}>Cancel</SecondaryButton>
            <DangerButton onClick={deleteRoom}>Delete</DangerButton>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function Index() {
  return (
    <AdminLayout title="Rooms" header="Rooms">
      <RoomsIndex />
    </AdminLayout>
  );
}
