import { createContext, useContext, useEffect, useState } from 'react';

const OrderContext = createContext();
const STORAGE_KEY = 'senyummies_commande_active';

export function OrderProvider({ children }) {
  const [commandeActive, setCommandeActive] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  });

  const [telephone, setTelephone] = useState(
    () => localStorage.getItem('senyummies_tel') || ''
  );

  useEffect(() => {
    if (commandeActive) localStorage.setItem(STORAGE_KEY, JSON.stringify(commandeActive));
    else localStorage.removeItem(STORAGE_KEY);
  }, [commandeActive]);

  useEffect(() => {
    if (telephone) localStorage.setItem('senyummies_tel', telephone);
  }, [telephone]);

  return (
    <OrderContext.Provider
      value={{ commandeActive, setCommandeActive, telephone, setTelephone }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder doit être utilisé dans OrderProvider');
  return ctx;
};