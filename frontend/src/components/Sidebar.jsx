import { NavLink } from "react-router-dom";
import AccessGuard from "./AccessGuard";
import { FiPieChart, FiUsers, FiCreditCard, FiList, FiAlertOctagon } from "react-icons/fi";

const Sidebar = () => {
    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg font-mono hover:text-white hover:tracking-wide transition-all ease-out duration-500 ${
            isActive
            ? "text-white bg-mauve-600 shadow-md"
            : "text-mauve-300 hover:bg-mauve-800"
        }`

    const fraudLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg font-mono transition-all ease-out duration-300 ${
            isActive
            ? "text-red-100 bg-red-900/80 border border-red-800 shadow-md"
            : "text-red-400 hover:bg-red-900/40 hover:text-red-300 hover:tracking-wide"
        }`;

    return (
        <aside className="w-64 bg-mauve-900 h-screen text-white flex flex-col">
            <div className="h-16 flex items-center justify-center border-b border-mauve-800">
                <h1 className="text-2xl font-bold tracking-wider text-indigo-200">
                    Vaulty
                </h1>
            </div>

            <div className="flex-1 p-4 space-y-8 overflow-y-auto mt-2">

                {/* MAIN SECTION */}
                <div>
                    <p className="px-4 text-[10px] font-bold text-mauve-500 uppercase tracking-widest mb-3">Main</p>
                    <nav className="flex flex-col gap-1">
                        <NavLink to="/" className={navLinkClass}>
                            <FiPieChart size={18} />
                            Dashboard
                        </NavLink>
                    </nav>
                </div>

                {/* OPERATIONS SECTION */}
                <div>
                    <p className="px-4 text-[10px] font-bold text-mauve-500 uppercase tracking-widest mb-3">Operations</p>
                    <nav className="flex flex-col gap-1">
                        <AccessGuard permission="view_transactions">
                            <NavLink to="/clients" className={navLinkClass}>
                                <FiUsers size={18} />
                                Clients
                            </NavLink>
                        </AccessGuard>

                        <NavLink to="/accounts" className={navLinkClass}>
                            <FiCreditCard size={18} />
                            Accounts
                        </NavLink>
                        <AccessGuard permission="view_transactions">
                            <NavLink to="/transactions" className={navLinkClass}>
                                <FiList size={18} />
                                Transactions
                            </NavLink>
                        </AccessGuard>
                    </nav>
                </div>
                
                {/* SECURITY SECTION */}
                <div>
                    <p className="px-4 text-[10px] font-bold text-mauve-500 uppercase tracking-widest mb-3">Security & Compliance</p>
                    <nav className="flex flex-col gap-1">
                        <AccessGuard permission="view_transactions">
                            <NavLink to="/fraud-alerts" className={navLinkClass}>
                                <FiAlertOctagon size={18}/>
                                Fraud alerts
                            </NavLink>
                        </AccessGuard>
                    </nav>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar;