import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Wrapper around react-hot-toast for consistent styling and behavior
 */

export const showToast = {
  /**
   * Success notification
   */
  success: (message: string, duration = 3000) => {
    toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  /**
   * Error notification
   */
  error: (message: string, duration = 4000) => {
    toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  /**
   * Info notification
   */
  info: (message: string, duration = 3000) => {
    toast(message, {
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  /**
   * Warning notification
   */
  warning: (message: string, duration = 3500) => {
    toast(message, {
      duration,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  /**
   * Loading notification
   * Returns the toast ID for dismissal
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Promise notification - shows loading, then success/error
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        style: {
          fontWeight: '500',
        },
      }
    );
  },
};

export default showToast;