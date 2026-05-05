import { useState, useEffect } from 'react';
import apiClient from '../api/client'
import { FiAlertCircle, FiFilter, FiSearch } from "react-icons/fi";
import { FaCircleCheck, FaFlag } from "react-icons/fa6";

const Accounts = () => {
    const[accounts, setAccounts] = useState([]);
    const[loading, setLoading] = useState(true);

    const[page, setPage] = useState(1);
    const[hasNext, setHasNext] = useState(false);
    const[hasPrevious, setHasPrevious] = useState(false);

    const[filterFrozen, setFilterFrozen] = useState(false);
    
    const[currencyFilter, setCurrencyFilter] = useState("");

    const[searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            try {
                let url = `accounts/?page=${page}`;
                if(filterFrozen){
                    url += `&is_frozen=${filterFrozen}`;
                } 
                if(currencyFilter){
                    url += `&currency=${currencyFilter}`;
                }
                if(searchQuery){
                    url += `&search=${searchQuery}`
                }

                const response = await apiClient.get(url)
                setAccounts(response.data.results);

                setHasNext(response.data.next !== null);
                setHasPrevious(response.data.previous !== null);
            } catch (error) {
                console.log("Loading error", error);
            } finally {
                setLoading(false);
            }
        }
        const delayBounceFn = setTimeout(() =>{
            fetchAccounts();
        }, 500);
        
    }, [page, filterFrozen, currencyFilter, searchQuery]);

    const toggleFrozenFilter = () => {
        setFilterFrozen((prev) => !prev);
        setPage(1);
    };

    const handleCurrencyChange = (e) => {
        setCurrencyFilter(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    }

    const toggleAccountStatus = async (accountId, currentStatus) => {
        const newStatus = currentStatus === "FROZEN" ? "ACTIVE" : "FROZEN";

        try {
            await apiClient.patch(`accounts/${accountId}/`, { status: newStatus });
            
            setAccounts((prevAccounts) => 
                prevAccounts.map((account) => 
                    account.id === accountId ? { ...account, status: newStatus } : account
                )
            );
        } catch(error) {
            console.log("Error when updating status:", error);
            alert("Couldn't change status of account. Check console")
        }
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h2>
                    Bank accounts
                </h2>
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-mauve-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, surname..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-mauve-300 rounded-lg text-sm text-mauve-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-mauve-500" />
                        <span className="text-sm font-medium text-mauve-600">Currency:</span>
                        
                        <select
                            value={currencyFilter}
                            onChange={handleCurrencyChange}
                            className="bg-white border border-mauve-200 text-mauve-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none cursor-pointer hover:bg-mauve-50 transition">
                            <option value="">All</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="UAH">UAH</option>
                        </select>
                    </div>
                    <button
                    onClick={toggleFrozenFilter}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterFrozen ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                            : "bg-white text-mauve-600 border border-mauve-200 hover:bg-mauve-50"
                        }`}
                    >
                    <FiFilter size={16} />
                    {filterFrozen ? 'Show all' : 'Only frozen'}
                    </button>
                </div>
            </div>
            {loading &&
            (
                <div className="text-mauve-500">
                    Loading accounts data...
                </div>
            )}
            {!loading && accounts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-mauve-50 p-4 rounded-full mb-4">
                        <FiSearch size={32} className="text-mauve-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-mauve-900 mb-1">
                        Accounts not found
                    </h3>
                    <p className="text-sm text-mauve-500 max-w-sm">
                        No accounts found for your request. Try to clear filters.
                    </p>
                </div>
            )}
            {!loading && accounts.length > 0 && (
                <div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-mauve-200 border-b text-mauve-500 font-mono">
                                <th className="pb-3">Client</th>
                                <th className="pl-1 pb-3">Account №</th>
                                <th className="pl-1 pb-3">Currency</th>
                                <th className="pl-1 pb-3 text-right">Balance</th>
                                <th className="pl-1 pb-3 text-center">Status</th>
                                <th className="pl-1 pb-3">Creation date</th>
                                <th className="pl-1 pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id} className="border-b border-b-mauve-200 hover:bg-mauve-100 transition duration-250">
                                    <td className="py-3 text-mauve-800 font-medium">
                                        {account.client_name}
                                        
                                    </td>
                                    <td className="pl-1 text-mauve-600">
                                        •••• {account.account_number.slice(-4)}
                                    </td>
                                    <td className="pl-1 text-mauve-600">
                                        {account.currency}
                                    </td>
                                    <td className="pl-1 text-mauve-600 text-right">
                                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(account.balance)}
                                    </td>
                                    <td>
                                        <div className="pl-1 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                account.status === "FROZEN" ?
                                                'bg-cyan-100 text-cyan-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {account.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="pl-1">
                                        {new Date(account.created_at).toLocaleDateString('uk-UA')}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleAccountStatus(account.id, account.status)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                account.status === "ACTIVE" 
                                                ? "bg-white text-mauve-400 border-mauve-200 hover:bg-cyan-50 hover:text-cyan-600 border hover:border-cyan-200" 
                                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                                            }`}
                                        >
                                            { account.status === "ACTIVE" ? "Freeze" : "Activate" }
                                        </button>
                                    </td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && (
                        <div className="flex items-center justify-between border-t border-mauve-200 mt-4 pt-4">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={!hasPrevious}
                                className="px-4 py-2 text-sm font-medium text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-500"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-mauve-500 font-medium">
                                Page {page}
                            </span>
                            <button
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={!hasNext}
                                className="px-4 py-2 text-sm font-medium text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-500"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Accounts;