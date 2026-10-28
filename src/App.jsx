import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';
import { NotifProvider } from './context/NotifContext';

import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import Accueil from './pages/Accueil';
import Menu from './pages/Menu';
import Panier from './pages/Panier';
import Confirmation from './pages/Confirmation';
import MesCommandes from './pages/MesCommandes';

let splashDejaVu = false;

export default function App() {
  const [splashTermine, setSplashTermine] = useState(splashDejaVu);

  const handleSplashFinish = useCallback(() => {
    splashDejaVu = true;
    setSplashTermine(true);
  }, []);

  return (
    <CartProvider>
      <OrderProvider>
        <ToastProvider>
          <NotifProvider>
            <BrowserRouter>
              {!splashTermine && (
                <SplashScreen onFinish={handleSplashFinish} duree={4500} />
              )}

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
          </NotifProvider>
        </ToastProvider>
      </OrderProvider>
    </CartProvider>
  );
}