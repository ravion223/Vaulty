import { useState, useEffect } from 'react';
import apiClient from '../api/client'

const Accounts = () => {
    const[accounts, setAccounts] = useState([]);
    const[loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await apiClient.get("accounts/")
                setAccounts(response.data.results);
            } catch (error) {
                console.log("Loading error", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAccounts();
    }, []);

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            <h2>
                Bank accounts
            </h2>
            {loading ? 
            (
                <div className="text-mauve-500">
                    Loading accounts data...
                </div>
            ) : (
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
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Accounts;