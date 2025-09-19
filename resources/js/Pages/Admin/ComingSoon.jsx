import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@iconify/react';

export default function ComingSoon({ feature = 'This feature' }) {
    return (
        <AdminLayout title={`${feature} - Coming Soon`} header={`${feature}`}>
            <Head title={`${feature} - Coming Soon`} />
            
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6 p-6 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Icon 
                        icon="lucide:construction" 
                        className="h-16 w-16 text-blue-600 dark:text-blue-400" 
                    />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Coming Soon
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-8">
                    {feature} is under development and will be available in a future update.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                        href={route('admin.dashboard')} 
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                    >
                        <Icon icon="lucide:arrow-left" />
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </AdminLayout>
    );
}