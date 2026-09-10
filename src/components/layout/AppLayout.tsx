import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <TopBar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
