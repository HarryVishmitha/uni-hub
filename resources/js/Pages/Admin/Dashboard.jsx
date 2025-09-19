import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout.jsx';

export default function Dashboard() {
    const { props } = usePage();
    const branch = props.branch;

    return (
        <AdminLayout title="Admin Dashboard" header="Admin Dashboard">
            <Head title="Admin Dashboard" />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Current Branch
                    </h3>
                    {branch ? (
                        <div className="mt-3 space-y-1 text-sm text-gray-800 dark:text-gray-200">
                            <div className="text-lg font-semibold">{branch.name}</div>
                            <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                {branch.code}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {branch.city ? `${branch.city}, ${branch.country ?? ''}` : 'No location set'}
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            Switch to a branch to see scoped activity.
                        </p>
                    )}
                </section>

                <section className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-300">
                    Hook up your executive KPIs here (enrolments, active curricula,
                    pending approvals, etc.).
                </section>

                <section className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-300">
                    This skeleton keeps Phase 1 lightweight—replace with cards and
                    charts as analytics become available.
                </section>
            </div>
        </AdminLayout>
    );
}
