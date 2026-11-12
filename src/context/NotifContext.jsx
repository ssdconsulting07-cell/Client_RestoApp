import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAnnoncesActives } from '../api/annonces';

// Annonces publiees par le Gerant (chaines de slides). Comme sur l'apercu
// Manager (AnnoncePopupPreview.jsx, "sur le modele de Max It / Orange
// Money") : le popup s'ouvre tout seul a l'arrivee quand une chaine n'a pas
// encore ete vue sur cet appareil ; la cloche permet de le rouvrir.
const NotifContext = createContext(null);
const CLE_VUES = 'senyummies_annonces_vues';

// Une chaine republiee (publishedAt modifie) redevient "nouvelle".
const cleChaine = (c) => `${c.id}@${c.publishedAt || c.updatedAt || ''}`;

function lireVues() {
  try {
    const vues = JSON.parse(localStorage.getItem(CLE_VUES));
    return Array.isArray(vues) ? vues : [];
  } catch {
    return [];
  }
}

export function NotifProvider({ children }) {
  const [chaines, setChaines] = useState([]);
  const [vues, setVues] = useState(lireVues);
  const [ouvert, setOuvert] = useState(false);
  const [autoOuvertureFaite, setAutoOuvertureFaite] = useState(false);

  useEffect(() => {
    getAnnoncesActives().then(setChaines).catch(() => setChaines([]));
  }, []);

  const nonVues = useMemo(
    () => chaines.filter((c) => !vues.includes(cleChaine(c))),
    [chaines, vues]
  );

  const marquerVues = useCallback(() => {
    const cles = chaines.map(cleChaine);
    setVues(cles);
    try {
      localStorage.setItem(CLE_VUES, JSON.stringify(cles));
    } catch {
      // non critique
    }
  }, [chaines]);

  const ouvrir = useCallback(() => setOuvert(true), []);
  const fermer = useCallback(() => {
    setOuvert(false);
    marquerVues();
  }, [marquerVues]);

  // Appele par App une fois l'ecran de demarrage termine.
  const ouvrirSiNouveautes = useCallback(() => {
    if (autoOuvertureFaite) return;
    if (nonVues.length > 0) {
      setOuvert(true);
      setAutoOuvertureFaite(true);
    }
  }, [autoOuvertureFaite, nonVues.length]);

  const valeur = useMemo(
    () => ({
      chaines,
      nbNouveautes: nonVues.length,
      ouvert,
      ouvrir,
      fermer,
      ouvrirSiNouveautes,
    }),
    [chaines, nonVues.length, ouvert, ouvrir, fermer, ouvrirSiNouveautes]
  );

  return <NotifContext.Provider value={valeur}>{children}</NotifContext.Provider>;
}

export const useNotif = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif doit être utilisé dans NotifProvider');
  return ctx;
};
