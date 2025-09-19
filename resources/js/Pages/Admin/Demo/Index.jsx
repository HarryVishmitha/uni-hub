import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ExampleAlertCard from '@/Components/Examples/ExampleAlertCard';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index() {
  const [alertType, setAlertType] = useState('info');
  const { data, setData, post, processing } = useForm({
    type: 'info',
    message: 'This is a flash message from the backend.',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.demo.flash-alert'));
  };

  return (
    <AdminLayout title="Alert System Demo" header="Alert System Demo">
      <Head title="Alert System Demo" />

      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Frontend Alerts
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            These alerts are triggered directly from the frontend using the <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">useAdminAlerts</code> hook.
          </p>
          
          <ExampleAlertCard />
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Backend Flash Alerts
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            These alerts are triggered from the backend using the <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">Flash</code> helper.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alert Message
              </label>
              <input
                type="text"
                id="message"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                value={data.message}
                onChange={(e) => setData('message', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alert Type
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="success"
                    checked={data.type === 'success'}
                    onChange={() => setData('type', 'success')}
                    className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Success</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="error"
                    checked={data.type === 'error'}
                    onChange={() => setData('type', 'error')}
                    className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Error</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="warning"
                    checked={data.type === 'warning'}
                    onChange={() => setData('type', 'warning')}
                    className="rounded border-gray-300 text-amber-600 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Warning</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="info"
                    checked={data.type === 'info'}
                    onChange={() => setData('type', 'info')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Info</span>
                </label>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
              >
                {processing ? 'Sending...' : 'Send Flash Alert'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Documentation
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            For detailed documentation on how to use the alert system, see:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>
              <a href="/docs/alert-system.md" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Alert System Documentation
              </a>
            </li>
            <li>
              <a href="/docs/alert-system-implementation.md" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Alert System Implementation
              </a>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}