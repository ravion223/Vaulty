import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const navLinkClass = ({ isActive }) =>
        `block px-4 py-2 rounded-lg font-mono hover:text-white hover:tracking-wide transition ease-out duration-500 ${
            isActive
            ? "text-white bg-mauve-600"
            : "text-mauve-300 hover:bg-mauve-800"
        }`

    return (
        <aside className="w-64 bg-mauve-900 h-screen text-white flex flex-col">
            <div className="h-16 flex items-center justify-center border-b border-mauve-800">
                <h1 className="text-2xl font-bold tracking-wider text-indigo-200">
                    VaultCore
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavLink to="/" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/clients" className={navLinkClass}>Clients</NavLink>
                <NavLink to="/accounts" className={navLinkClass}>Accounts</NavLink>
                <NavLink to="/transactions" className={navLinkClass}>Transactions</NavLink>
            </nav>
        </aside>
    )
}

export default Sidebar;