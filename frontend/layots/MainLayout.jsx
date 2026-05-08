import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from 'react-router-dom';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-mauve-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;