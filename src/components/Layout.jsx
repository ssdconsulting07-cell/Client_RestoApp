import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import TopBar from './TopBar';
import NotifPopup from './NotifPopup';
import ScrollEnHaut from './ScrollEnHaut';

// Smartphone (< 768 px) : onglets en bas, a portee de pouce.
// Tablette / ordinateur (>= 768 px) : barre de navigation en haut.
export default function Layout() {
  return (
    <>
      <ScrollEnHaut />
      <TopBar />
      <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] md:min-h-[calc(100dvh-4rem)] md:pb-12">
        <Outlet />
      </div>
      <NavBar />
      <NotifPopup />
    </>
  );
}
