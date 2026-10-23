import { createContext, useContext, useEffect, useState } from 'react';
import { getNouveautes } from '../api/nouveautes';

const NotifContext = createContext();
const STORAGE_KEY = 'senyummies_nouveautes_vues';

export function NotifProvider({ children }) {
  const [nouveautes, setNouveautes] = useState([]);
  const [vues, setVues] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    getNouveautes().then(setNouveautes).catch(() => {});
  }, []);

  const marquerToutVu = () => {
    const ids = nouveautes.map((n) => n.id);
    setVues(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  };

  const ouvrir = () => {
    setOuvert(true);
    marquerToutVu();
  };

  const fermer = () => setOuvert(false);

  const nonVues = nouveautes.filter((n) => !vues.includes(n.id));
  const nbNouveautes = nouveautes.length;

  return (
    <NotifContext.Provider
      value={{
        nouveautes,
        nonVues,
        nbNouveautes,
        marquerToutVu,
        ouvert,
        ouvrir,
        fermer,
      }}
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