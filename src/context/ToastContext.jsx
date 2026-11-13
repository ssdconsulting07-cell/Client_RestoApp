import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

// Duree par defaut selon le type : une erreur reste plus longtemps qu'un
// succes (le temps de la lire), un toast avec action (ex. "Annuler")
// encore plus (le temps de reagir).
const DUREES = { succes: 2400, info: 3800, alerte: 4500, erreur: 5000 };

const ICONES = {
  succes: <CheckCircle2 size={18} className="shrink-0 text-green-400" aria-hidden="true" />,
  info: <Info size={18} className="shrink-0 text-sky-300" aria-hidden="true" />,
  alerte: <AlertTriangle size={18} className="shrink-0 text-amber-300" aria-hidden="true" />,
  erreur: <AlertCircle size={18} className="shrink-0 text-red-300" aria-hidden="true" />,
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const minuteur = useRef(null);

  useEffect(() => () => clearTimeout(minuteur.current), []);

  const fermer = useCallback(() => {
    clearTimeout(minuteur.current);
    setToast(null);
  }, []);

  // showToast(message, { type: 'succes' | 'info' | 'alerte' | 'erreur',
  //                      duree, action: { label, onClick } })
  const showToast = useCallback(
    (message, { duree, type = 'succes', action = null } = {}) => {
      clearTimeout(minuteur.current);
      setToast({ message, type, action, id: Date.now() });
      minuteur.current = setTimeout(fermer, duree ?? (action ? 6000 : DUREES[type] || DUREES.succes));
    },
    [fermer]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live={toast?.type === 'erreur' ? 'assertive' : 'polite'}
        className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[400] flex justify-center px-4"
      >
        {toast && (
          <div
            key={toast.id}
            role={toast.type === 'erreur' ? 'alert' : 'status'}
            className="pointer-events-auto flex max-w-full animate-[toastIn_0.25s_ease-out] items-center gap-2 rounded-xl bg-ink py-3 pl-4 pr-3 text-sm font-medium text-white shadow-float"
          >
            {ICONES[toast.type] || ICONES.succes}
            <span className="min-w-0">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  fermer();
                }}
                className="-my-1 ml-1 min-h-9 shrink-0 rounded-lg px-2.5 text-sm font-bold text-[#ff8a99] hover:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
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
