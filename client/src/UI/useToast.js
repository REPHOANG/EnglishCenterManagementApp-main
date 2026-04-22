import { useState, useCallback } from 'react';

/**
 * useToast - Custom hook để quản lý danh sách toast notifications.
 *
 * Usage:
 *   const { toasts, showToast, removeToast } = useToast();
 *
 *   showToast('Login successful!');                      // success (default)
 *   showToast('Something went wrong', 'error');          // error
 *   showToast('Please wait...', 'info', 2000);           // info, 2s
 *   showToast('Check your input', 'warning');            // warning
 *
 *   <Toast toasts={toasts} onRemove={removeToast} />
 */
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

export default useToast;
