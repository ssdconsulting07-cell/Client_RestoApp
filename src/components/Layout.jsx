import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import NotifPopup from './NotifPopup';

export default function Layout() {
  return (
    <>
      <main className="min-h-screen pb-24 bg-surface-alt dark:bg-dark-surface-alt transition-colors">
        <Outlet />
      </main>

      <NavBar />
      <NotifPopup />
    </>
  );
}