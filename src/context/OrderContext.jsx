import { createContext, useContext, useEffect, useState } from 'react';

const OrderContext = createContext();
const STORAGE_KEY = 'senyummies_tel';

export function OrderProvider({ children }) {
  const [telephone, setTelephone] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ''
  );

  useEffect(() => {
    if (telephone) localStorage.setItem(STORAGE_KEY, telephone);
  }, [telephone]);

  return (
    <OrderContext.Provider value={{ telephone, setTelephone }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder doit être utilisé dans OrderProvider');
  return ctx;
};