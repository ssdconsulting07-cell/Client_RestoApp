import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { appliquerMarque } from './config/marque';

// Couleur, titre de l'onglet : la marque du restaurant, avant le 1er rendu.
appliquerMarque();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA : service worker uniquement en production (en dev, il mettrait en
// cache les modules Vite et masquerait les modifications).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // L'app reste utilisable sans mode hors ligne.
    });
  });
}
