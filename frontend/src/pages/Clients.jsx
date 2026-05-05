import { useState, useEffect } from 'react';
import { FiFilter } from "react-icons/fi";
import apiClient from '../api/client';
import { FiSearch } from "react-icons/fi"
// add pagination
const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    
    const [riskFilter, setRiskFilter] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() =>{
        const fetchClients = async () => {
            setLoading(true);
            try {
                let url = `clients/?page=${page}`;
                if (riskFilter){
                    url += `&risk=${riskFilter}`;
                }
                
                if (searchQuery){
                    url += `&search=${searchQuery}`;
                }
                const response = await apiClient.get(url);
                setClients(response.data.results);

                setHasNext(response.data.next !== null);
                setHasPrevious(response.data.previous !== null);
            } catch (error) {
                console.error("Loading error", error)
            } finally {
                setLoading(false);
            }
        };
        
        const delayDebounceFn = setTimeout(() => {
            fetchClients();
        }, 500);

        return () => clearTimeout(delayDebounceFn)
    }, [page, riskFilter, searchQuery]);

    const handleRiskFilter = (e) => {
        setRiskFilter(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            <div className="flex justify-between items-center">
                <h2 className="font-stretch-expanded">
                    Bank clients
                </h2>
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-mauve-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-mauve-300 rounded-lg text-sm text-mauve-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <FiFilter className="text-mauve-500" />
                    <span className="text-sm font-medium text-mauve-600">Risk:</span>
                    <select
                    value={riskFilter}
                    onChange={handleRiskFilter}
                    className="bg-white border border-mauve-200 text-mauve-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none cursor-pointer hover:bg-mauve-50 transition duration-500">
                        <option value="">All</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>
            {loading && (
                <div className="text-mauve-500">
                    Loading clients data...
                </div>
            )}
            {!loading && clients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-mauve-50 p-4 rounded-full mb-4">
                        <FiSearch size={32} className="text-mauve-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-mauve-900 mb-1">
                        Clients not found
                    </h3>
                    <p className="text-sm text-mauve-500 max-w-sm">
                        No clients found for your request. Try to change search text or clear filters.
                    </p>
                </div>
            )}
            {!loading && clients.length > 0 && (
                <div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-mauve-200 text-mauve-500">
                                <th className="pb-3 font-mono">Name and surname</th>
                                <th className="pl-1 pb-3 font-mono">Email</th>
                                <th className="pl-1 pb-3 font-mono">Risk</th>
                                <th className="pl-1 pb-3 font-mono">Accounts count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) =>(
                                <tr key={client.id} className="border-b border-mauve-200 hover:bg-mauve-100 transition duration-250">
                                    <td className="py-3 text-mauve-800 font-medium">
                                        {client.first_name} {client.last_name}
                                    </td>
                                    <td className="pl-1 text-mauve-60">{client.email}</td>
                                    <td className="py-3">
                                        <div className="pl-">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                client.risk_level === "HIGH" ?
                                                'bg-red-100 text-red-700' : client.risk_level === "MEDIUM" ?
                                                'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'}`}>
                                                {client.risk_level}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="pl-1">{client.accounts.length}</td>
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

export default Clients;