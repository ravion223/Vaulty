import { useEffect, useState } from "react"
import apiClient from "../api/client"
import { FaFlag } from "react-icons/fa";
import { GoDash } from "react-icons/go";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const[page, setPage] = useState(1);
    const[hasNext, setHasNext] = useState(false);
    const[hasPrevious, setHasPrevious] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try{
                const response = await apiClient.get("transactions/");
                setTransactions(response.data.results);

                setHasNext(response.data.next !== null)
                setHasPrevious(response.data.previous !== null)
            } catch (error) {
                console.log("Loading error", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTransactions() 
    }, [page]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            <h2>
                Bank transactions
            </h2>
            {loading ? 
            (
                <div className="text-mauve-500">
                    Loading transaction data...
                </div>
            ) : (
                <div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-mauve-200 border-b text-mauve-500 font-mono">
                                <th className="pb-3">Sender</th>
                                <th className="pl-1 pb-3">Receiver</th>
                                <th className="pl-1 pb-3">Amount</th>
                                <th className="pl-1 pb-3">Status</th>
                                <th className="pl-1 pb-3">is flagged</th>
                                <th className="pl-1 pb-3">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b border-b-mauve-200 hover:bg-mauve-100 transition duration-250">
                                    <td className="py-3 text-mauve-800 font-medium">
                                        {transaction.receiver_name}
                                        
                                    </td>
                                    <td className="pl-1 text-mauve-800 font-medium">
                                        {transaction.sender_name}
                                    </td>
                                    <td className="pl-1 text-mauve-600">
                                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(transaction.amount)}
                                    </td>
                                    <td>
                                        <div className="pl-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                transaction.status === "COMPLETED" ? 'bg-emerald-100 text-emerald-700' :
                                                transaction.status === "PROCESSING" ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="pl-1">
                                        {transaction.is_flagged 
                                        ?(
                                            <span className="gap-1 text-xs py-1 px-2 inline-flex items-center bg-red-100 text-red-700 font-semibold rounded-full">
                                                <FaFlag /> Flagged
                                            </span>
                                        ) : <GoDash />}
                                    </td>
                                    <td className="pl-1">
                                        {new Date(transaction.timestamp).toLocaleDateString('uk-UA')}
                                    </td>
                                    
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

export default Transactions;