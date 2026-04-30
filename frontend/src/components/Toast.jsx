import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={toastContainerStyle}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...toastStyle, ...typeStyles[t.type] }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const toastContainerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const toastStyle = {
  padding: '14px 24px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  animation: 'slideIn 0.3s ease',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
};

const typeStyles = {
  success: { background: 'var(--success)' },
  error: { background: 'var(--danger)' },
  warning: { background: 'var(--warning)' },
  info: { background: 'var(--ink)' },
};

