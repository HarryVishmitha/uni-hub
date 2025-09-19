import { useAlerts } from '@/Contexts/AlertContext';

/**
 * Hook to use AdminLayout alerts anywhere in your application
 * This is a utility function that can be imported in any component
 * to show alerts without needing to wrap components in providers
 * 
 * @example
 * import { useAdminAlerts } from '@/Hooks/useAdminAlerts';
 * 
 * function MyComponent() {
 *   const { success, error } = useAdminAlerts();
 *   
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       success('Data saved successfully!');
 *     } catch (err) {
 *       error('Failed to save data: ' + err.message);
 *     }
 *   };
 *   
 *   return <button onClick={handleSave}>Save</button>;
 * }
 */
export function useAdminAlerts() {
  return useAlerts();
}

// Default export for convenience
export default useAdminAlerts;