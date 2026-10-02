import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, duration = 2000) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-ink text-white px-4 py-3 rounded-md shadow-float flex items-center gap-2 text-sm font-medium animate-[slideDown_0.25s_ease-out]"
        >
          <CheckCircle2 size={18} className="text-success" />
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans ToastProvider');
  return ctx;
};