import { createContext, useContext, useEffect, useState } from 'react';
import { getNouveautes } from '../api/nouveautes';

const NotifContext = createContext();

export function NotifProvider({ children }) {
  const [nouveautes, setNouveautes] = useState([]);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    getNouveautes().then(setNouveautes).catch(() => {});
  }, []);

  const ouvrir = () => setOuvert(true);
  const fermer = () => setOuvert(false);

  const nbNouveautes = nouveautes.length;

  return (
    <NotifContext.Provider
      value={{ nouveautes, nbNouveautes, ouvert, ouvrir, fermer }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif doit être utilisé dans NotifProvider');
  return ctx;
};