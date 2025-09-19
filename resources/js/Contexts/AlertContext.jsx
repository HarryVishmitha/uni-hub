import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

// Create context
const AlertContext = createContext();

/**
 * Alert provider that manages alerts across the application
 */
export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const { flash } = usePage().props;
  
  // Generate a unique ID for each alert
  const generateId = () => `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add a new alert
  const addAlert = useCallback((alert) => {
    const id = alert.id || generateId();
    setAlerts(prev => [...prev, { ...alert, id }]);
    return id;
  }, []);
  
  // Remove an alert by ID
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);
  
  // Success alert shorthand
  const success = useCallback((message, options = {}) => {
    return addAlert({ type: 'success', message, timeout: 5000, ...options });
  }, [addAlert]);
  
  // Error alert shorthand
  const error = useCallback((message, options = {}) => {
    return addAlert({ type: 'error', message, timeout: 0, ...options });
  }, [addAlert]);
  
  // Warning alert shorthand
  const warning = useCallback((message, options = {}) => {
    return addAlert({ type: 'warning', message, timeout: 7000, ...options });
  }, [addAlert]);
  
  // Info alert shorthand
  const info = useCallback((message, options = {}) => {
    return addAlert({ type: 'info', message, timeout: 5000, ...options });
  }, [addAlert]);
  
  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);
  
  // Process flash messages from backend
  useEffect(() => {
    if (flash?.alert) {
      const { type, message } = flash.alert;
      
      if (type === 'success') success(message);
      else if (type === 'error') error(message);
      else if (type === 'warning') warning(message);
      else if (type === 'info') info(message);
    }
  }, [flash, success, error, warning, info]);
  
  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info,
    clearAlerts
  };
  
  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

// Hook for using alerts
export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}

// Export the context for direct use
export default AlertContext;