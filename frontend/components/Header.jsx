const Header = () => {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
      <div className="text-xl font-semibold text-mauve-700">View</div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-mauve-600">Manager: Admin</span>
        <button className="px-4 py-2 bg-mauve-100 text-mauve-700 rounded-lg hover:bg-mauve-200 transition text-sm font-medium">
          Log out
        </button>
      </div>
    </header>
  );
};

export default Header;