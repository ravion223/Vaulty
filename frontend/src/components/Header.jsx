import React from 'react';
import { FaUserTie } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username")
  const role = localStorage.getItem("role_name")

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role_name');
    localStorage.removeItem('permissions');

    navigate('/login');
  }
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-end px-4 md:px-6 z-10 gap-4">      
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <FaUserTie className='text-mauve-500 shrink-0'/>
          <span className="text-sm font-medium text-mauve-600 truncate max-w-120px sm:max-w-none"> 
            {username}
            <span className='hidden sm:inline text-mauve-400 font-normal'> ({role})</span>
          </span>
        </div>
        <button 
        onClick={handleLogout}
        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-mauve-100 text-mauve-700 rounded-lg hover:bg-mauve-200 transition text-xs sm:text-sm font-medium shrink-0">
          Log out
        </button>
      </div>
    </header>
  );
};

export default Header;