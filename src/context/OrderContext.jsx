import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Coordonnees du client memorisees sur l'appareil apres une commande :
// - telephone (+221XXXXXXXXX) : cle pour retrouver ses commandes sans compte
//   (GET /commandes?clientTelephone=), "Mes commandes" s'ouvre directement ;
// - prenom / nom : pre-remplissage du formulaire a la commande suivante.
// Rien n'est enregistre avant une commande reussie. oublier() efface tout
// (appareil partage).
const OrderContext = createContext(null);
const CLE_TEL = 'senyummies_tel';
const CLE_IDENTITE = 'senyummies_client';

function lireTel() {
  try {
    const tel = localStorage.getItem(CLE_TEL) || '';
    return tel.startsWith('+221') ? tel : '';
  } catch {
    return '';
  }
}

function lireIdentite() {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_IDENTITE));
    return { prenom: String(brut?.prenom || ''), nom: String(brut?.nom || '') };
  } catch {
    return { prenom: '', nom: '' };
  }
}

export function OrderProvider({ children }) {
  const [telephone, setTelephone] = useState(lireTel);
  const [identite, setIdentite] = useState(lireIdentite);

  useEffect(() => {
    try {
      if (telephone) localStorage.setItem(CLE_TEL, telephone);
      else localStorage.removeItem(CLE_TEL);
    } catch {
      // Stockage indisponible : le numero reste en memoire pour la session.
    }
  }, [telephone]);

  useEffect(() => {
    try {
      if (identite.prenom || identite.nom) localStorage.setItem(CLE_IDENTITE, JSON.stringify(identite));
      else localStorage.removeItem(CLE_IDENTITE);
    } catch {
      // non critique
    }
  }, [identite]);

  const memoriserClient = useCallback(({ telephone: tel, prenom, nom }) => {
    setTelephone(tel);
    setIdentite({ prenom: prenom || '', nom: nom || '' });
  }, []);

  const oublier = useCallback(() => {
    setTelephone('');
    setIdentite({ prenom: '', nom: '' });
  }, []);

  return (
    <OrderContext.Provider value={{ telephone, setTelephone, identite, memoriserClient, oublier }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder doit être utilisé dans OrderProvider');
  return ctx;
};
