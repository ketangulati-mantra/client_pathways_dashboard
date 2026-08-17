import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  const getToastConfig = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: '#ffffff',
          border: '#fca5a5',
          accent: '#ef4444',
          iconBg: '#fee2e2',
          icon: <AlertCircle size={16} color="#dc2626" />
        };
      case 'info':
        return {
          bg: '#ffffff',
          border: '#93c5fd',
          accent: '#2563eb',
          iconBg: '#dbeafe',
          icon: <Info size={16} color="#2563eb" />
        };
      case 'success':
      default:
        return {
          bg: '#ffffff',
          border: '#86efac',
          accent: '#16a34a',
          iconBg: '#dcfce7',
          icon: <CheckCircle2 size={16} color="#15803d" />
        };
    }
  };

  const config = toast ? getToastConfig(toast.type) : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && config && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: config.bg,
          color: '#0f172a',
          padding: '10px 16px 10px 12px',
          borderRadius: '10px',
          border: `1px solid ${config.border}`,
          borderLeft: `4px solid ${config.accent}`,
          boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999999,
          maxWidth: '380px',
          animation: 'slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: config.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {config.icon}
          </div>

          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, flex: 1 }}>
            {toast.message}
          </span>

          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

/**
 * @typedef {'success' | 'error' | 'info'} ToastType
 * @typedef {(message: string, type?: ToastType, duration?: number) => void} ShowToastFn
 */

/**
 * @returns {{ showToast: ShowToastFn }}
 */
export const useToast = () => useContext(ToastContext) || { showToast: (message, type = 'success', duration = 3500) => {} };


