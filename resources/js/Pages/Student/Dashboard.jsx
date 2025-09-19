import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Student Portal</h2>}
            homeRoute="student.dashboard"
            homeLabel="Student Dashboard"
        >
            <Head title="Student Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Welcome Back
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Course schedules, curriculum progress, and tuition balances will
                            surface here in upcoming phases.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
