import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-app-gradient text-slate-900 transition-colors dark:text-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
