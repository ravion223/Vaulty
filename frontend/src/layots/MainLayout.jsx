import Sidebar from "../components/Sidebar"
import Header from "../components/Header";
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-mauve-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;