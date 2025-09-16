import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ScopeInspectorShow({ inspectedUser, scoped, appointments }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Scope Inspector
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {inspectedUser.name}
                        </span>{' '}
                        ({inspectedUser.email})
                    </div>
                </div>
            }
        >
            <Head title="Scope Inspector" />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Effective Scope
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                        <div>
                            <span className="font-semibold">Global Access:</span>{' '}
                            {scoped.global ? 'Yes' : 'No'}
                        </div>
                        <div>
                            <span className="font-semibold">Unit IDs:</span>{' '}
                            {scoped.unit_ids && scoped.unit_ids.length > 0
                                ? scoped.unit_ids.join(', ')
                                : 'None'}
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Active Appointments
                    </h3>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/30">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Role
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Scope Mode
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Organizational Unit
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Active Window
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {appointments.length === 0 && (
                                    <tr>
                                        <td
                                            className="px-3 py-4 text-sm text-gray-500 dark:text-gray-300"
                                            colSpan={4}
                                        >
                                            No appointments registered.
                                        </td>
                                    </tr>
                                )}
                                {appointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {appointment.role ?? '—'}
                                        </td>
                                        <td className="px-3 py-2 text-sm capitalize text-gray-700 dark:text-gray-200">
                                            {appointment.scope_mode}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {appointment.organizational_unit ? (
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {appointment.organizational_unit.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Code: {appointment.organizational_unit.code} •
                                                        ID: {appointment.organizational_unit.id}
                                                    </div>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            <div className="flex flex-col">
                                                <span>
                                                    From: {appointment.start_at ?? '—'}
                                                </span>
                                                <span>
                                                    To: {appointment.end_at ?? '—'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
