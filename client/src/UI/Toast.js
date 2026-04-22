import React, { useEffect, useState } from 'react';

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

const STYLES = {
  success: {
    container: 'bg-white border-l-4 border-green-500 text-gray-800',
    icon: 'text-green-500',
    progress: 'bg-green-500',
  },
  error: {
    container: 'bg-white border-l-4 border-red-500 text-gray-800',
    icon: 'text-red-500',
    progress: 'bg-red-500',
  },
  info: {
    container: 'bg-white border-l-4 border-sky-500 text-gray-800',
    icon: 'text-sky-500',
    progress: 'bg-sky-500',
  },
  warning: {
    container: 'bg-white border-l-4 border-yellow-500 text-gray-800',
    icon: 'text-yellow-500',
    progress: 'bg-yellow-500',
  },
};

// ── Single Toast Item ────────────────────────────────────────────────────────
const ToastItem = ({ id, type = 'success', message, duration = 3500, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const style = STYLES[type] || STYLES.success;

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(t);
  }, [duration]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 min-w-[280px] max-w-sm w-full
        ${style.container}
        rounded-xl shadow-lg px-4 py-3 relative overflow-hidden
        transition-all duration-300 ease-out
        ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}
      `}
    >
      {/* Icon */}
      <span className={`shrink-0 mt-0.5 ${style.icon}`}>
        {ICONS[type]}
      </span>

      {/* Message */}
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition mt-0.5"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${style.progress} rounded-full`}
        style={{
          animation: `toast-shrink ${duration}ms linear forwards`,
          width: '100%',
        }}
      />

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// ── Toast Container ──────────────────────────────────────────────────────────
const Toast = ({ toasts, onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onRemove={onRemove}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;
