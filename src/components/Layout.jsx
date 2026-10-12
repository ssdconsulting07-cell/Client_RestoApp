import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function Layout() {
  return (
    <>
      <main className="min-h-screen pb-24">
        <Outlet />
      </main>

      <NavBar />
    </>
  );
}