import { useState, useEffect } from 'react';
import apiClient from '../api/client'
// add pagination
const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        const fetchClients = async () => {
            try {
                const response = await apiClient.get("clients/");
                setClients(response.data.results);
            } catch (error) {
                console.error("Loading error", error)
            } finally {
                setLoading(false);
            }
        };
        
        fetchClients();
    }, []);

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
                </div>
            )}
        </div>
    )
}

export default Clients;