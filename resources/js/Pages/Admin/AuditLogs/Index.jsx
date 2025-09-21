import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import TextInput from '@/Components/TextInput.jsx';
import InputLabel from '@/Components/InputLabel.jsx';
import SecondaryButton from '@/Components/SecondaryButton.jsx';

function AuditLogsPage() {
  const { props } = usePage();
  const { logs, filters = {}, logOptions = [], eventOptions = [], userOptions = [] } = props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [logName, setLogName] = useState(filters.log_name ?? '');
  const [event, setEvent] = useState(filters.event ?? '');
  const [userId, setUserId] = useState(filters.user_id ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('admin.audit-logs.index'), {
        search: search || undefined,
        log_name: logName || undefined,
        event: event || undefined,
        user_id: userId || undefined,
      }, {
        preserveState: true,
        replace: true,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, logName, event, userId]);

  const records = useMemo(() => logs?.data ?? [], [logs]);

  return (
    <>
      <Head title="Audit Logs" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Logs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review system activity across the platform.</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <InputLabel htmlFor="log-search" value="Search" />
              <TextInput
                id="log-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Description contains…"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <InputLabel htmlFor="log-name-filter" value="Log" />
              <select
                id="log-name-filter"
                value={logName}
                onChange={(e) => setLogName(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All logs</option>
                {logOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <InputLabel htmlFor="log-event-filter" value="Event" />
              <select
                id="log-event-filter"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All events</option>
                {eventOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <InputLabel htmlFor="log-user-filter" value="User" />
              <select
                id="log-user-filter"
                value={userId || ''}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All users</option>
                {userOptions.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/70">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Log</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {records.length ? records.map((log) => (
                  <tr key={log.id} className="align-top">
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.causer?.name ?? 'System'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.log_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.event || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div>{log.description || '—'}</div>
                      {log.properties && Object.keys(log.properties).length > 0 && (
                        <details className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <summary className="cursor-pointer text-indigo-500 dark:text-indigo-300">View properties</summary>
                          <pre className="mt-2 overflow-auto rounded-lg bg-gray-100 p-3 text-[11px] text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            {JSON.stringify(log.properties, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No audit events recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {logs?.links && (
            <div className="flex flex-wrap items-center gap-2">
              {logs.links.map((link, index) => (
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
    </>
  );
}

export default function AuditLogsIndexPage() {
  return (
    <AdminLayout title="Audit Logs" header="Audit Logs">
      <AuditLogsPage />
    </AdminLayout>
  );
}
