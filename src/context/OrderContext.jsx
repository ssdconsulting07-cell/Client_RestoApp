import { createContext, useContext, useEffect, useState } from 'react';

// Telephone du client (format +221XXXXXXXXX) memorise sur l'appareil : il
// permet de retrouver ses commandes sans compte (GET /commandes?clientTelephone=).
const OrderContext = createContext(null);
const STORAGE_KEY = 'senyummies_tel';

function lire() {
  try {
    const tel = localStorage.getItem(STORAGE_KEY) || '';
    return tel.startsWith('+221') ? tel : '';
  } catch {
    return '';
  }
}

export function OrderProvider({ children }) {
  const [telephone, setTelephone] = useState(lire);

  useEffect(() => {
    try {
      if (telephone) localStorage.setItem(STORAGE_KEY, telephone);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Stockage indisponible : le numero reste en memoire pour la session.
    }
  }, [telephone]);

  return (
    <OrderContext.Provider value={{ telephone, setTelephone }}>{children}</OrderContext.Provider>
  );
}

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder doit être utilisé dans OrderProvider');
  return ctx;
};
