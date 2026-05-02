import { useState, useEffect } from 'react';
import apiClient from '../api/client'
// add pagination
const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    useEffect(() =>{
        const fetchClients = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`clients/?page=${page}`);
                setClients(response.data.results);

                setHasNext(response.data.next !== null);
                setHasPrevious(response.data.previous !== null);
            } catch (error) {
                console.error("Loading error", error)
            } finally {
                setLoading(false);
            }
        };
        
        fetchClients();
    }, [page]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            <h2 className="font-stretch-expanded">
                Bank clients
            </h2>
            {loading ? (
                <div className="text-mauve-500">
                    Loading clients data...
                </div>
            ) : (
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
                                    <div className="pl-">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            client.risk_level === "HIGH" ?
                                            'bg-red-100 text-red-700' : client.risk_level === "MEDIUM" ?
                                            'bg-amber-100 text-amber-700' :
                                            'bg-emerald-100 text-emerald-700'}`}>
                                            <td className="py-3">{client.risk_level}</td>
                                        </span>
                                    </div>
                                    <td className="pl-1">{client.accounts.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && (
                        <div className="flex items-center justify-between border-t border-mauve-200 mt-4 pt-4">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disable={!hasPrevious}
                                className="px-4 py-2 text-sm font-medium text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-500"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-mauve-500 font-medium">
                                Page {page}
                            </span>
                            <button
                                onClick={() => setPage((prev) => prev + 1)}
                                disable={!hasNext}
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