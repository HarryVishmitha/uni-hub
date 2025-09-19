import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.jsx';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Front Office</h2>}
            homeRoute="front_office.dashboard"
            homeLabel="Front Office"
        >
            <Head title="Front Office Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Intake Overview
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Admissions queues, application status, and messaging widgets
                            will land here as we wire up student services.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
