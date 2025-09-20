/**
 * Utility functions for working with alerts across the application
 */

import { router } from '@inertiajs/react';

/**
 * Add default alert handling to Inertia form submissions
 * @param {Object} options - The options object
 * @param {Function} options.success - The success alert function
 * @param {Function} options.error - The error alert function
 * @param {string} options.successMessage - The success message
 * @param {string} options.errorMessage - The default error message
 * @param {Function} options.onSuccess - Additional success callback
 * @param {Function} options.onError - Additional error callback
 * @returns {Object} - Enhanced options with alert handling
 */
export function withAlerts(options = {}) {
  const {
    success,
    error,
    successMessage,
    errorMessage = 'An error occurred',
    onSuccess,
    onError,
    ...rest
  } = options;

  return {
    ...rest,
    onSuccess: (page) => {
      if (successMessage && success) {
        success(successMessage);
      }
      if (onSuccess) {
        onSuccess(page);
      }
    },
    onError: (errors) => {
      if (error) {
        if (typeof errors === 'object' && Object.keys(errors).length > 0) {
          error(Object.values(errors).flat().join('\n'));
        } else if (typeof errors === 'string') {
          error(errors);
        } else {
          error(errorMessage);
        }
      }
      if (onError) {
        onError(errors);
      }
    }
  };
}

/**
 * Perform a form submission with alert handling
 * @param {Object} params - The submission parameters
 * @param {string} params.method - HTTP method (get, post, put, patch, delete)
 * @param {string} params.url - The URL to submit to
 * @param {Object} params.data - The data to submit
 * @param {Function} params.success - The success alert function
 * @param {Function} params.error - The error alert function
 * @param {string} params.successMessage - The success message
 * @param {string} params.errorMessage - The default error message
 * @param {Function} params.onSuccess - Additional success callback
 * @param {Function} params.onError - Additional error callback
 * @param {Object} params.options - Additional Inertia options
 */
export function submitWithAlerts({
  method = 'post',
  url,
  data = {},
  success,
  error,
  successMessage,
  errorMessage = 'An error occurred',
  onSuccess,
  onError,
  options = {}
}) {
  const enhancedOptions = withAlerts({
    success,
    error,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    ...options
  });

  router[method](url, data, enhancedOptions);
}

/**
 * Confirm an action with the user before proceeding
 * @param {Object} params - The confirmation parameters
 * @param {string} params.message - The confirmation message
 * @param {Function} params.action - The action to perform if confirmed
 * @param {Function} params.cancelAction - Optional action to perform if cancelled
 */
export function confirmAction({ message, action, cancelAction }) {
  if (confirm(message)) {
    action();
  } else if (cancelAction) {
    cancelAction();
  }
}