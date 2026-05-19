import { useEffect, useState } from "react"
import apiClient from "../api/client"
import { FaCircleCheck, FaFlag } from "react-icons/fa6";
import { GoDash } from "react-icons/go";
import { FiSearch, FiAlertCircle, FiFilter, FiCheck, FiFlag, FiDownload } from "react-icons/fi";
import AddTransactionModal from "../components/AddTransactionModal"
import Table from "../components/Table";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const[page, setPage] = useState(1);
    const[hasNext, setHasNext] = useState(false);
    const[hasPrevious, setHasPrevious] = useState(false);

    const[filterFlagged, setFilterFlagged] = useState(false); 
    const[statusFilter, setStatusFilter] = useState("");

    const[searchQuery, setSearchQuery] = useState("");
    const[isAddModalOpen, setIsAddModalOpen] = useState(false);

    const columns = [
        {
            header: 'Transaction ID',
            className: 'pr-4',
            render: (transaction) => (
                <>
                    <div className="font-mono text-sm font-medium text-mauve-900" title={transaction.id}>
                    TRX-{transaction.id.slice(0, 6)}
                </div>
                <div className="text-[11px] font-bold mt-0.5">
                    {transaction.is_flagged ? (
                        <span className="text-red-500 flex items-center gap-1">
                            <FaFlag size={10} /> FLAGGED
                        </span>
                    ) : (
                        <span className="text-mauve-400">CLEAR</span>
                    )}
                </div>
                </>
            )
        },
        {
            header: 'Participants',
            className: "pl-1",
            render: (transaction) => (
                <>
                    <div className="text-sm font-semibold text-mauve-900">
                        To: {transaction.receiver_name}
                    </div>
                    <div className="text-xs text-mauve-500 mt-0.5">
                        From: {transaction.sender_name}
                    </div>
                </>   
            )
        },
        {
            header: 'Amount',
            className: "pl-1 pr-4 text-right",
            render: (transaction) => (
                <div className="text-sm font-bold text-mauve-900">
                    {formatCurrency(transaction.amount, transaction.currency)}
                </div>
            )
        },
        {
            header: 'Status',
            className: "pl-1 pr-4 text-center",
            render: (transaction) => (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                    transaction.status === "COMPLETED" ? 'bg-emerald-100 text-emerald-700' :
                    transaction.status === "PROCESSING" ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    {transaction.status}
                </span>
            )
        },
        {
            header: 'Date & Time',
            className: "pl-1 pr-4",
            render: (transaction) => (
                <>
                    <div className="text-sm text-mauve-800 font-medium">
                        {new Date(transaction.timestamp).toLocaleDateString('uk-UA')}
                    </div>
                    <div className="text-xs text-mauve-500 mt-0.5">
                        {new Date(transaction.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </>
            )
        },
        {
            header: 'Actions',
            className: "pl-1 text-center",
            render: (transaction) => (
                <>
                    <button
                        onClick={() => toggleFlagTransaction(transaction.id, transaction.is_flagged)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                        transaction.is_flagged 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm"
                            : "bg-white text-mauve-500 border-mauve-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        }`}
                    >
                        {transaction.is_flagged ? (
                        <>
                            <FiCheck size={14} /> Resolve
                        </>
                        ) : (
                        <>
                            <FiFlag size={14} /> Report
                        </>
                        )}
                    </button>
                </>
            )
        }

    ]

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try{
                let url = `transactions/?page=${page}`;
                if(filterFlagged) {
                    url += `&is_flagged=${filterFlagged}`;
                }
                if(searchQuery) {
                    url += `&search=${searchQuery}`;
                }
                if(statusFilter) {
                    url += `&status=${statusFilter}`;
                }

                const response = await apiClient.get(url);
                setTransactions(response.data.results);

                setHasNext(response.data.next !== null)
                setHasPrevious(response.data.previous !== null)
            } catch (error) {
                console.log("Loading error", error);
            } finally {
                setLoading(false);
            }
        }

        const delayDebounceFn = setTimeout(() => {
            fetchTransactions()
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [page, filterFlagged, searchQuery, statusFilter]);

    const toggleFlaggedFilter = () => {
        setFilterFlagged((prev) => !prev);
        setPage(1);
    }

    const toggleFlagTransaction = async (transactionId, isFlagged) => {
        const newFlaggedStatus = !isFlagged
        
        try {
            await apiClient.patch(`transactions/${transactionId}/`, {is_flagged: newFlaggedStatus})

            setTransactions((prevTransactions) => 
                prevTransactions.map((transaction) => 
                    transaction.id === transactionId ? {...transaction, is_flagged: newFlaggedStatus} : transaction
                )
        )} catch(error) {
            console.log("Error when changing flagged status:", error)
            alert("Couldn't changed status for transaction")
        }
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    }

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    }

    const handleAddTransaction = async (data) => {
        try {
            const response = await apiClient.post('transactions/', data);
            setTransactions((prev) => [response.data, ...prev]);
        } catch (error) {
            console.error('Failed to create transaction: ', error);
            throw error;
        }
    }

    const formatCurrency = (amount, currencyCode = "USD") => {
        const locale = currencyCode === 'EUR' ? 'de-DE' : currencyCode === 'UAH' ? 'uk-UA' : 'en-US';

        return new Intl.NumberFormat(locale,
            {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2
            }
        ).format(amount);
    }

    const handleExportCSV = async () => {
        try {
            const response = await apiClient.get('/transactions/export_csv/', {
                responseType: 'blob' // binary
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_report_${new Date().toISOString().slice(0, 10)}.csv`);

            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log("Couldn't download csv: ", error);
            alert("Something went wrong when downloading csv...");
        }
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h2>
                        Bank transactions
                    </h2>
                    {!loading && transactions.length !== 0 && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors duration-300 shadow-sm whitespace-nowrap"
                        >
                            + New transaction
                        </button>
                    )}
                    
                </div>
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
                            <span className="text-sm font-medium text-mauve-600">Status:</span>
                            
                            <select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className="bg-white border border-mauve-200 text-mauve-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none cursor-pointer hover:bg-mauve-50 transition">
                                <option value="">All</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="FAILED">Failed</option>
                            </select>
                    </div>
                    <button
                        onClick={toggleFlaggedFilter}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterFlagged ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-white text-mauve-600 border border-mauve-200 hover:bg-mauve-50"
                        }`}
                    >
                        <FiFilter size={16} />
                        {filterFlagged ? "Show all" : "Only flagged"}
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={loading || transactions.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-mauve-600 border border-mauve-200 hover:bg-emerald-600 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiDownload size={16} />
                    </button>
                </div>
            </div>
            <div>
                <Table
                    columns={columns}
                    data={transactions}
                    loading={loading}
                    page={page}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    onNext={() => setPage((prev) => prev + 1)}
                    onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
                />
            </div>
            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddTransaction}
            />
        </div>
    )
}

export default Transactions;