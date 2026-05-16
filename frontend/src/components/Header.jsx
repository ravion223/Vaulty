import React from 'react';
import { FaUserTie } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username")

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');

    navigate('/login');
  }
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
      <div className="text-xl font-semibold text-mauve-700">View</div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2">
          <FaUserTie />
          <span className="text-sm font-medium text-mauve-600"> {username}</span>
        </div>
        <button 
        onClick={handleLogout}
        className="px-4 py-2 bg-mauve-100 text-mauve-700 rounded-lg hover:bg-mauve-200 transition text-sm font-medium">
          Log out
        </button>
      </div>
    </header>
  );
};

export default Header;