import { Icon } from '@iconify/react';
import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Alert component for displaying notifications
 * 
 * @param {Object} props
 * @param {string} props.type - Alert type: 'success', 'warning', 'error', 'info'
 * @param {string} props.message - Alert message text
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {number} props.timeout - Auto-dismiss after timeout (ms), 0 means no auto-dismiss
 * @param {function} props.onDismiss - Callback when alert is dismissed
 */
export default function Alert({ 
  type = 'info', 
  message, 
  dismissible = true, 
  timeout = 0,
  onDismiss 
}) {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(timeout);
  const timeoutRef = useRef(null);
  
  // Define dismiss function before it's used in useEffect
  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);
  
  // Auto-dismiss timer
  useEffect(() => {
    if (timeout > 0) {
      // Start with full timeout
      setTimeLeft(timeout);
      
      const startTime = Date.now();
      
      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, timeout - elapsed);
        
        // Update time left every 100ms for smoother UI updates
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          dismiss();
        } else {
          timeoutRef.current = setTimeout(() => {
            requestAnimationFrame(updateTimer);
          }, 100); // Update every 100ms for smooth countdown
        }
      };
      
      timeoutRef.current = requestAnimationFrame(updateTimer);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [timeout, dismiss]);
  
  if (!visible) return null;
  
  // Progress percentage for timeout indicator
  const progressPercent = timeout > 0 ? (timeLeft / timeout) * 100 : 0;
  
  // Configure styles based on type
  const config = {
    success: {
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      textColor: 'text-emerald-800 dark:text-emerald-100',
      icon: 'lucide:check-circle',
      progressColor: 'bg-emerald-500',
      shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/20'
    },
    warning: {
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-800 dark:text-amber-100',
      icon: 'lucide:alert-triangle',
      progressColor: 'bg-amber-500',
      shadowColor: 'shadow-amber-200 dark:shadow-amber-900/20'
    },
    error: {
      borderColor: 'border-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-100',
      icon: 'lucide:alert-circle',
      progressColor: 'bg-red-500',
      shadowColor: 'shadow-red-200 dark:shadow-red-900/20'
    },
    info: {
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-100',
      icon: 'lucide:info',
      progressColor: 'bg-blue-500',
      shadowColor: 'shadow-blue-200 dark:shadow-blue-900/20'
    }
  };
  
  const alertConfig = config[type] || config.info;
  
  return (
    <div 
      className={`relative flex items-start gap-3 p-4 border-l-4 rounded-lg shadow-md overflow-hidden ${alertConfig.shadowColor} ${alertConfig.borderColor} ${alertConfig.bgColor} ${alertConfig.textColor}`}
      role="alert"
    >
      <Icon icon={alertConfig.icon} className="text-xl flex-shrink-0 mt-0.5" />
      
      <div className="flex-grow">
        <div className="text-sm font-medium whitespace-pre-line">{message}</div>
        {timeout > 0 && (
          <div className="text-xs mt-1 opacity-70">
            Auto-dismiss in {Math.ceil(timeLeft / 1000)}s
          </div>
        )}
      </div>
      
      {dismissible && (
        <button 
          onClick={dismiss} 
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/30 dark:hover:bg-black/20 transition-colors"
          aria-label="Dismiss"
        >
          <Icon icon="lucide:x" className="text-sm" />
        </button>
      )}
      
      {/* Progress bar for timeout - positioned at the bottom of the alert */}
      {timeout > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/5 dark:bg-white/5">
          <div 
            className={`h-full ${alertConfig.progressColor}`}
            style={{ 
              width: `${progressPercent}%`,
              transition: 'width 0.1s linear'
            }}
            aria-hidden="true"
          ></div>
        </div>
      )}
    </div>
  );
}