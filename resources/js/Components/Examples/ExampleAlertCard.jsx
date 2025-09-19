import { useState } from 'react';
import { useAdminAlerts } from '@/Hooks/useAdminAlerts';
import { Icon } from '@iconify/react';

/**
 * Example card component that demonstrates using alerts
 * You can include this in your admin dashboard to show how alerts work
 */
export default function ExampleAlertCard() {
  const { success, error, warning, info } = useAdminAlerts();
  const [loading, setLoading] = useState(false);
  const [timeoutDuration, setTimeoutDuration] = useState(5);
  
  const showAlert = (type) => {
    setLoading(true);
    
    // Calculate timeout in milliseconds (0 means no auto-dismiss)
    const timeout = type === 'error' ? 0 : timeoutDuration * 1000;
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      switch(type) {
        case 'success':
          success('Operation completed successfully! This alert will auto-dismiss.', { timeout });
          break;
        case 'error':
          error('An error occurred. This alert will not auto-dismiss unless you set a timeout.', { timeout });
          break;
        case 'warning':
          warning('This action may have consequences. Review carefully before proceeding.', { timeout });
          break;
        case 'info':
          info('The system will undergo maintenance on Saturday, 10PM - 2AM.', { timeout });
          break;
        default:
          info('This is a default alert.', { timeout });
      }
    }, 600);
  };
  
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Alert System Demo
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Click the buttons below to see different types of alerts. Each alert includes a timeout indicator showing when it will automatically dismiss.
      </p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Auto-dismiss Timeout (seconds)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="10"
            value={timeoutDuration}
            onChange={(e) => setTimeoutDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm font-medium w-10 text-center">{timeoutDuration}s</span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Error alerts default to no auto-dismiss (can be overridden).
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => showAlert('success')}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
        >
          {loading ? <Icon icon="lucide:loader-2" className="animate-spin" /> : <Icon icon="lucide:check-circle" />}
          Success
        </button>
        
        <button
          onClick={() => showAlert('error')}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
        >
          {loading ? <Icon icon="lucide:loader-2" className="animate-spin" /> : <Icon icon="lucide:alert-circle" />}
          Error
        </button>
        
        <button
          onClick={() => showAlert('warning')}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/40"
        >
          {loading ? <Icon icon="lucide:loader-2" className="animate-spin" /> : <Icon icon="lucide:alert-triangle" />}
          Warning
        </button>
        
        <button
          onClick={() => showAlert('info')}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
        >
          {loading ? <Icon icon="lucide:loader-2" className="animate-spin" /> : <Icon icon="lucide:info" />}
          Info
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>New features: animated entrance/exit, timeout indicator with progress bar, and customizable timeout duration.</p>
      </div>
    </div>
  );
}