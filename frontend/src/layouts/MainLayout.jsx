import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <Outlet />
    </main>
    <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
      KRIBUDWEBTECH Real-Time Job Interview Platform
    </footer>
  </div>
);
