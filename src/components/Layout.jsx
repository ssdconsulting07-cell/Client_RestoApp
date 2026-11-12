import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import NotifPopup from './NotifPopup';
import ScrollEnHaut from './ScrollEnHaut';

export default function Layout() {
  return (
    <>
      <ScrollEnHaut />
      {/* Reserve la hauteur de la barre de navigation + l'encoche iPhone. */}
      <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <NavBar />
      <NotifPopup />
    </>
  );
}
