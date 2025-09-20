import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useAlerts } from '@/Contexts/AlertContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Inner component that uses AlertProvider from AdminLayout
function TermsIndex() {
  const { props } = usePage();
  const { terms, filters, statusOptions = [], branches = [] } = props;
  const defaultStatus = statusOptions?.[0] ?? 'planned';
  const { addAlert, success, error, warning, info } = useAlerts();
  
  // Define all state variables
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);
  
  const [search, setSearch] = useState(filters?.search ?? '');
  const [branchId, setBranchId] = useState(filters?.branch_id ?? '');
  const [status, setStatus] = useState(filters?.status ?? '');
  
  // Create form handling
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    code: '',
    branch_id: branchId || usePage().props.auth?.user?.branch_id || '',
    start_date: '',
    end_date: '',
    status: defaultStatus,
    description: ''
  });
  
  // Edit form handling
  const editForm = useForm({
    title: '',
    code: '',
    branch_id: '',
    start_date: '',
    end_date: '',
    status: defaultStatus,
    description: ''
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('admin.terms.index'), { search, branch_id: branchId, status }, { preserveState: true, replace: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, branchId, status]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTerms(terms?.data?.map(term => term.id) || []);
    } else {
      setSelectedTerms([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedTerms(prev => {
      if (prev.includes(id)) {
        return prev.filter(termId => termId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const confirmDelete = (term) => {
    setTermToDelete(term);
    setConfirmingDeletion(true);
  };

  const deleteTerm = () => {
    if (!termToDelete) return;
    
    router.delete(route('admin.terms.destroy', termToDelete.id), {
      preserveScroll: true,
      onSuccess: () => {
        setConfirmingDeletion(false);
        setTermToDelete(null);
        // Show success alert to the user
        success(`Term "${termToDelete.title}" deleted successfully`);
      },
      onError: (errors) => {
        // Show error alert if deletion fails
        error(errors?.message || 'Failed to delete term');
      }
    });
  };
  
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    post(route('admin.terms.store'), {
      onSuccess: () => {
        success('Term created successfully');
        setIsCreateOpen(false);
        reset();
      },
      onError: (errors) => {
        error(Object.values(errors).flat().join('\n') || 'Failed to create term');
      },
      preserveScroll: true,
    });
  };
  
  const handleEditSubmit = (e) => {
    e.preventDefault();
    editForm.put(route('admin.terms.update', editing.id), {
      onSuccess: () => {
        success(`Term "${editing.title || editing.name}" updated successfully`);
        setEditing(null);
        editForm.reset();
      },
      onError: (errors) => {
        error(Object.values(errors).flat().join('\n') || 'Failed to update term');
      },
      preserveScroll: true,
    });
  };
  
  const normalizedStatusOptions = useMemo(() => {
    return (statusOptions ?? [])
      .map((option, index) => {
        if (typeof option === 'string') {
          const label = option.charAt(0).toUpperCase() + option.slice(1);
          return {
            key: `status-${index}-${option}`,
            value: option,
            label,
          };
        }

        const value = option?.value ?? option?.id ?? option?.slug ?? option?.name ?? null;
        const label = option?.label ?? option?.name ?? option?.title ?? (typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value) ?? `Status ${index + 1}`;
        const key = option?.key ?? `status-${index}-${value ?? 'unknown'}`;

        if (value === null || value === undefined || value === '') {
          return null;
        }

        return {
          key,
          value,
          label,
        };
      })
      .filter(Boolean);
  }, [statusOptions]);

  // Format date for DatePicker
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };
  
  // Set edit form data when editing state changes
  useEffect(() => {
    if (editing) {
      editForm.setData({
        title: editing.title || editing.name || '',
        code: editing.code || '',
        branch_id: editing.branch_id || '',
        start_date: editing.start_date ? formatDate(editing.start_date) : null,
        end_date: editing.end_date ? formatDate(editing.end_date) : null,
        status: editing.status || defaultStatus,
        description: editing.description || ''
      });
    }
  }, [editing]);

  return (
    <>
      <Head title="Terms" />
      
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Academic Terms</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your academic calendar with terms and semesters.</p>
          </div>
          <PrimaryButton onClick={() => setIsCreateOpen(true)}>New Term</PrimaryButton>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div className="w-full max-w-sm">
              <InputLabel htmlFor="term-search" value="Search" />
              <TextInput 
                id="term-search" 
                className="mt-1 block w-full" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Name or code" 
              />
            </div>
            
            <div className="w-full max-w-xs">
              <InputLabel htmlFor="filter-branch" value="Branch" />
              <select
                id="filter-branch"
                value={branchId ?? ''}
                onChange={(e) => setBranchId(e.target.value || '')}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option key="all-branches" value="">All Branches</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full max-w-xs">
              <InputLabel htmlFor="filter-status" value="Status" />
              <select
                id="filter-status"
                value={status ?? ''}
                onChange={(e) => setStatus(e.target.value || '')}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option key="all-statuses" value="">All Statuses</option>
                {normalizedStatusOptions.map((statusOption) => (
                  <option key={statusOption.key} value={statusOption.value}>{statusOption.label}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTerms.length > 0 && (
            <div className="mb-4 flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedTerms.length} term(s) selected
              </span>
              <div className="flex gap-2">
                <SecondaryButton
                  onClick={() => {
                    // Handle bulk actions
                    router.post(route('admin.terms.bulk-status'), {
                      terms: selectedTerms,
                      status: 'inactive'
                    }, {
                      onSuccess: () => {
                        success(`Status changed for ${selectedTerms.length} terms`);
                      },
                      onError: (errors) => {
                        error(errors?.message || 'Failed to update terms');
                      }
                    });
                  }}
                >
                  Change Status
                </SecondaryButton>
                <DangerButton
                  onClick={() => {
                    if (confirm(`Delete ${selectedTerms.length} selected terms?`)) {
                      // Handle bulk delete through a request to backend
                      router.post(route('admin.terms.bulk-delete'), {
                        terms: selectedTerms
                      }, {
                        onSuccess: () => {
                          success(`${selectedTerms.length} terms deleted successfully`);
                          setSelectedTerms([]);
                        },
                        onError: (errors) => {
                          error(errors?.message || 'Failed to delete terms');
                        }
                      });
                    }
                  }}
                >
                  Delete Selected
                </DangerButton>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="w-px px-4 py-3">
                    <Checkbox 
                      checked={terms?.data?.length > 0 && selectedTerms.length === terms.data.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-900 dark:bg-gray-900">
                {terms?.data?.length ? terms.data.map((term) => (
                  <tr key={term.id} className={selectedTerms.includes(term.id) ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : ''}>
                    <td className="w-px px-4 py-3">
                      <Checkbox 
                        checked={selectedTerms.includes(term.id)}
                        onChange={() => handleSelect(term.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{term.title || term.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{term.code}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {term.start_date} - {term.end_date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {term.branch?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        term.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 
                        term.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' :
                        term.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                      }`}>
                        {term.status_label || term.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <SecondaryButton onClick={() => setEditing(term)}>Edit</SecondaryButton>
                        <DangerButton onClick={() => confirmDelete(term)}>Delete</DangerButton>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={6}>No terms available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {terms?.links && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {terms.links.map((link) => (
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

      {/* Create Modal - With form and alerts */}
      <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="lg">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Create Term</h2>
          
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4">
              <div>
                <InputLabel htmlFor="title" value="Title" />
                <TextInput
                  id="title"
                  className="mt-1 block w-full"
                  value={data.title}
                  onChange={e => setData('title', e.target.value)}
                  required
                />
                <InputError message={errors.title} className="mt-2" />
              </div>
              
              <div>
                <InputLabel htmlFor="code" value="Term Code" />
                <TextInput
                  id="code"
                  className="mt-1 block w-full"
                  value={data.code}
                  onChange={e => setData('code', e.target.value)}
                  required
                />
                <InputError message={errors.code} className="mt-2" />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="start_date" value="Start Date" />
                  <div className="mt-1">
                    <DatePicker
                      selected={data.start_date ? formatDate(data.start_date) : null}
                      onChange={date => setData('start_date', date)}
                      dateFormat="yyyy-MM-dd"
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <InputError message={errors.start_date} className="mt-2" />
                </div>
                
                <div>
                  <InputLabel htmlFor="end_date" value="End Date" />
                  <div className="mt-1">
                    <DatePicker
                      selected={data.end_date ? formatDate(data.end_date) : null}
                      onChange={date => setData('end_date', date)}
                      dateFormat="yyyy-MM-dd"
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <InputError message={errors.end_date} className="mt-2" />
                </div>
              </div>
              
              <div>
                <InputLabel htmlFor="branch_id" value="Branch" />
                <select
                  id="branch_id"
                  value={data.branch_id || ''}
                  onChange={e => setData('branch_id', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="" disabled>Select Branch</option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                <InputError message={errors.branch_id} className="mt-2" />
              </div>
              
              <div>
                <InputLabel htmlFor="status" value="Status" />
                <select
                  id="status"
                  value={data.status || ''}
                  onChange={e => setData('status', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="" disabled>Select Status</option>
                  {normalizedStatusOptions.map((statusOption) => (
                    <option key={statusOption.key} value={statusOption.value}>{statusOption.label}</option>
                  ))}
                </select>
                <InputError message={errors.status} className="mt-2" />
              </div>
              
              <div>
                <InputLabel htmlFor="description" value="Description (Optional)" />
                <textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  rows={3}
                />
                <InputError message={errors.description} className="mt-2" />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <SecondaryButton type="button" onClick={() => {
                setIsCreateOpen(false);
                reset();
              }}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" className="ml-3" disabled={processing}>
                {processing ? 'Creating...' : 'Create'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Modal - With form and alerts */}
      <Modal show={editing !== null} onClose={() => setEditing(null)} maxWidth="lg">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Edit Term</h2>
          
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
              <div>
                <InputLabel htmlFor="edit_title" value="Title" />
                <TextInput
                  id="edit_title"
                  className="mt-1 block w-full"
                  value={editForm.data.title}
                  onChange={e => editForm.setData('title', e.target.value)}
                  required
                />
                <InputError message={editForm.errors.title} className="mt-2" />
              </div>
              
              <div>
                <InputLabel htmlFor="edit_code" value="Term Code" />
                <TextInput
                  id="edit_code"
                  className="mt-1 block w-full"
                  value={editForm.data.code}
                  onChange={e => editForm.setData('code', e.target.value)}
                  required
                />
                <InputError message={editForm.errors.code} className="mt-2" />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="edit_start_date" value="Start Date" />
                  <div className="mt-1">
                    <DatePicker
                      selected={editForm.data.start_date}
                      onChange={date => editForm.setData('start_date', date)}
                      dateFormat="yyyy-MM-dd"
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <InputError message={editForm.errors.start_date} className="mt-2" />
                </div>
                
                <div>
                  <InputLabel htmlFor="edit_end_date" value="End Date" />
                  <div className="mt-1">
                    <DatePicker
                      selected={editForm.data.end_date}
                      onChange={date => editForm.setData('end_date', date)}
                      dateFormat="yyyy-MM-dd"
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <InputError message={editForm.errors.end_date} className="mt-2" />
                </div>
              </div>
              
              <div>
                <InputLabel htmlFor="edit_branch_id" value="Branch" />
                <select
                  id="edit_branch_id"
                  value={editForm.data.branch_id || ''}
                  onChange={e => editForm.setData('branch_id', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="" disabled>Select Branch</option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                <InputError message={editForm.errors.branch_id} className="mt-2" />
              </div>
              
              <div>
                <InputLabel htmlFor="edit_status" value="Status" />
                <select
                  id="edit_status"
                  value={editForm.data.status || ''}
                  onChange={e => editForm.setData('status', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="" disabled>Select Status</option>
                  {normalizedStatusOptions.map((statusOption) => (
                    <option key={statusOption.key} value={statusOption.value}>{statusOption.label}</option>
                  ))}
                </select>
                <InputError message={editForm.errors.status} className="mt-2" />
              </div>
              
              <div>
                <InputLabel htmlFor="edit_description" value="Description (Optional)" />
                <textarea
                  id="edit_description"
                  value={editForm.data.description}
                  onChange={e => editForm.setData('description', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  rows={3}
                />
                <InputError message={editForm.errors.description} className="mt-2" />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <SecondaryButton type="button" onClick={() => {
                setEditing(null);
                editForm.reset();
              }}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" className="ml-3" disabled={editForm.processing}>
                {editForm.processing ? 'Saving...' : 'Save'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)} maxWidth="sm">
        <div className="p-6">
          <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Delete Term</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this term? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={() => setConfirmingDeletion(false)}>Cancel</SecondaryButton>
            <DangerButton className="ml-3" onClick={deleteTerm}>Delete</DangerButton>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Wrap the component with AdminLayout which provides AlertProvider
export default function Index() {
  return (
    <AdminLayout title="Terms" header="Terms">
      <TermsIndex />
    </AdminLayout>
  );
}
