import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';
import { NotifProvider, useNotif } from './context/NotifContext';
import { CatalogueProvider } from './context/CatalogueContext';

import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import EtatReseau from './components/EtatReseau';
import Accueil from './pages/Accueil';
import Menu from './pages/Menu';
import Panier from './pages/Panier';
import Confirmation from './pages/Confirmation';
import MesCommandes from './pages/MesCommandes';

// L'ecran de demarrage n'est montre qu'une fois par session (pas a chaque
// rechargement ni a chaque retour sur l'app installee).
function splashDejaVu() {
  try {
    return sessionStorage.getItem('senyummies_splash') === '1';
  } catch {
    return false;
  }
}

function Application() {
  const [splashTermine, setSplashTermine] = useState(splashDejaVu);
  const { ouvrirSiNouveautes } = useNotif();

  const handleSplashFinish = useCallback(() => {
    try {
      sessionStorage.setItem('senyummies_splash', '1');
    } catch {
      // non critique
    }
    setSplashTermine(true);
  }, []);

  // Popup d'annonces a l'arrivee, une fois l'ecran de demarrage ferme.
  useEffect(() => {
    if (splashTermine) ouvrirSiNouveautes();
  }, [splashTermine, ouvrirSiNouveautes]);

  return (
    <BrowserRouter>
      {!splashTermine && <SplashScreen onFinish={handleSplashFinish} duree={2600} />}
      <EtatReseau />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/panier" element={<Panier />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/commandes" element={<MesCommandes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <CatalogueProvider>
      <CartProvider>
        <OrderProvider>
          <ToastProvider>
            <NotifProvider>
              <Application />
            </NotifProvider>
          </ToastProvider>
        </OrderProvider>
      </CartProvider>
    </CatalogueProvider>
  );
}
