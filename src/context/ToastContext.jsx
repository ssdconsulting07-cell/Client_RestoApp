import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const minuteur = useRef(null);

  useEffect(() => () => clearTimeout(minuteur.current), []);

  const showToast = useCallback((message, { duree = 2200, type = 'succes' } = {}) => {
    clearTimeout(minuteur.current);
    setToast({ message, type, id: Date.now() });
    minuteur.current = setTimeout(() => setToast(null), duree);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[400] flex justify-center px-4"
      >
        {toast && (
          <div
            key={toast.id}
            className="flex max-w-full animate-[toastIn_0.25s_ease-out] items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-float"
          >
            {toast.type === 'erreur' ? (
              <AlertCircle size={18} className="shrink-0 text-red-300" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 text-green-400" aria-hidden="true" />
            )}
            <span className="min-w-0">{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans ToastProvider');
  return ctx;
};
