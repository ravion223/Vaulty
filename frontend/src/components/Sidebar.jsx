import { NavLink } from "react-router-dom";
import AccessGuard from "./AccessGuard";
import { FiPieChart, FiUsers, FiCreditCard, FiList, FiAlertOctagon, FiX, FiMenu } from "react-icons/fi";
import { useState } from "react";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false)

    const navLinkClass = ({ isActive }) => {
        const dynamicSpacing = isOpen 
            ? "px-4 gap-3 justify-start" 
            : "px-0 md:px-4 gap-0 md:gap-3 justify-center md:justify-start";
        
        return `flex items-center gap-3 px-4 py-2 rounded-lg font-mono hover:text-white hover:tracking-wide transition-all ease-out duration-500 ${
            isActive
            ? "text-white bg-mauve-600 shadow-md"
            : "text-mauve-300 hover:bg-mauve-800"
        }`;
    };
    

    const fraudLinkClass = ({ isActive }) =>{
        const dynamicSpacing = isOpen 
            ? "px-4 gap-3 justify-start" 
            : "px-0 md:px-4 gap-0 md:gap-3 justify-center md:justify-start";

        return `flex items-center gap-3 px-4 py-2 rounded-lg font-mono transition-all ease-out duration-300 ${
            isActive
            ? "text-red-100 bg-red-900/80 border border-red-800 shadow-md"
            : "text-red-400 hover:bg-red-900/40 hover:text-red-300 hover:tracking-wide"
        }`;
    };
        

    return (
        <aside className={`bg-mauve-900 h-screen text-white flex flex-col transition-all duration-300 ease-in-out ${
            isOpen ? "w-64" : "w-16 md:w-64"
        }`}>
            <div className={`h-16 flex items-center border-b border-mauve-800 ${
                isOpen ? "px-4 justify-between" : "px-2 md:px-7 justify-center md:justify-start gap-1 md:gap-0"
            }`}>
                <h1 className="text-2xl font-bold tracking-wider text-indigo-200">
                    V
                    <span className={isOpen ? "inline" : "hidden md:inline"}>
                        aulty
                    </span>
                </h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-1.5 rounded-lg text-mauve-300 hover:text-white hover:bg-mauve-800 transition duration-200 outline-none"
                >
                    {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
            </div>

            <div className="flex-1 p-2 md:p-4 space-y-8 overflow-y-auto mt-2">

                {/* MAIN SECTION */}
                <div>
                    <p className={`px-4 text-[10px] font-bold text-mauve-500 uppercase tracking-widest mb-3 ${
                        isOpen ? "block" : "hidden md:block"
                    }`}>
                        Main
                    </p>
                    <nav className="flex flex-col gap-1">
                        <NavLink to="/" className={navLinkClass}>
                            <FiPieChart size={18} className="shrink-0" />
                            <span className={isOpen ? "inline" : "hidden md:inline"}>
                                Dashboard
                            </span>
                        </NavLink>
                    </nav>
                </div>

                {/* OPERATIONS SECTION */}
                <div>
                    <p className={`px-4 text-[10px] font-bold text-mauve-500 uppercase tracking-widest mb-3 ${
                        isOpen ? "block" : "hidden md:block"
                    }`}>
                        Operations
                    </p>
                    <nav className="flex flex-col gap-1">
                        <AccessGuard permission="view_clients">
                            <NavLink to="/clients" className={navLinkClass}>
                                <FiUsers size={18} className="shrink-0" />
                                <span className={isOpen ? "inline" : "hidden md:inline"}>
                                    Clients
                                </span>
                            </NavLink>
                        </AccessGuard>

                        <NavLink to="/accounts" className={navLinkClass}>
                            <FiCreditCard size={18} className="shrink-0" />
                            <span className={isOpen ? "inline" : "hidden md:inline"}>
                                Accounts
                            </span>
                        </NavLink>
                        <AccessGuard permission="view_transactions">
                            <NavLink to="/transactions" className={navLinkClass}>
                                <FiList size={18} />
                                <span className={isOpen ? "inline" : "hidden md:inline"}>
                                    Transactions
                                </span>
                            </NavLink>
                        </AccessGuard>
                    </nav>
                </div>
                
                {/* SECURITY SECTION */}
                <div>
                    <p className={`px-4 text-[10px] font-bold text-mauve-500 uppercase tracking-widest mb-3 ${
                        isOpen ? "block" : "hidden md:block"
                    }`}>
                        Security & Compliance
                    </p>
                    <nav className="flex flex-col gap-1">
                        <AccessGuard permission="view_transactions">
                            <NavLink to="/fraud-alerts" className={navLinkClass}>
                                <FiAlertOctagon size={18} className="shrink-0" />
                                <span className={isOpen ? "inline" : "hidden md:inline"}>
                                    Fraud Alerts
                                </span>
                            </NavLink>
                        </AccessGuard>
                    </nav>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar;