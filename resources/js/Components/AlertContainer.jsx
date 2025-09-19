import { useState, useEffect } from 'react';
import Alert from '@/Components/Alert';

/**
 * AlertContainer component for managing multiple alerts
 * 
 * Each alert has:
 * - id: unique identifier
 * - type: 'success', 'warning', 'error', 'info'
 * - message: string content (can be multiline)
 * - timeout: milliseconds until auto-dismiss (0 = no auto-dismiss)
 */
export default function AlertContainer({ alerts = [], onDismiss }) {
  // Filter to only show visible alerts
  const [visibleAlerts, setVisibleAlerts] = useState(alerts);
  const [animatingAlerts, setAnimatingAlerts] = useState({});
  
  // Update visible alerts when the alerts prop changes
  useEffect(() => {
    // Track new alerts for entrance animations
    const newAlertIds = alerts.filter(a => !visibleAlerts.some(va => va.id === a.id)).map(a => a.id);
    
    if (newAlertIds.length > 0) {
      const newAnimatingState = { ...animatingAlerts };
      
      newAlertIds.forEach(id => {
        newAnimatingState[id] = 'enter';
        
        // After animation completes, remove the animation state
        setTimeout(() => {
          setAnimatingAlerts(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
        }, 500); // Match the CSS transition duration
      });
      
      setAnimatingAlerts(newAnimatingState);
    }
    
    setVisibleAlerts(alerts);
  }, [alerts]);
  
  // Handle dismissing a single alert
  const handleDismiss = (id) => {
    // Add exit animation
    setAnimatingAlerts(prev => ({ ...prev, [id]: 'exit' }));
    
    // After animation completes, remove from visible alerts
    setTimeout(() => {
      setVisibleAlerts(prev => prev.filter(alert => alert.id !== id));
      if (onDismiss) {
        onDismiss(id);
      }
      
      // Clean up animation state
      setAnimatingAlerts(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }, 300); // Match the CSS transition duration
  };
  
  if (!visibleAlerts.length) return null;
  
  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2 pb-4 pointer-events-none">
      {visibleAlerts.map(alert => {
        const animationState = animatingAlerts[alert.id] || '';
        const animationClasses = 
          animationState === 'enter' ? 'animate-slide-in-right opacity-0' :
          animationState === 'exit' ? 'animate-slide-out-right opacity-0' : '';
          
        return (
          <div 
            key={alert.id} 
            className={`transform transition-all duration-300 ease-out pointer-events-auto ${animationClasses}`}
          >
            <Alert
              type={alert.type}
              message={alert.message}
              dismissible={alert.dismissible !== false}
              timeout={alert.timeout || 0}
              onDismiss={() => handleDismiss(alert.id)}
            />
          </div>
        );
      })}
    </div>
  );
}