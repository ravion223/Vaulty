import { useState, useEffect } from 'react';
import apiClient from '../api/client'
import { FiAlertCircle, FiFilter, FiSearch } from "react-icons/fi";
import { FaCircleCheck, FaFlag } from "react-icons/fa6";
import AddAccountModal from '../components/AddAccountModal';
import Table from '../components/Table';
import AccessGuard from '../components/AccessGuard';

const Accounts = () => {
    const[accounts, setAccounts] = useState([]);
    const[loading, setLoading] = useState(true);

    const[page, setPage] = useState(1);
    const[hasNext, setHasNext] = useState(false);
    const[hasPrevious, setHasPrevious] = useState(false);

    const[filterFrozen, setFilterFrozen] = useState(false);
    
    const[currencyFilter, setCurrencyFilter] = useState("");

    const[searchQuery, setSearchQuery] = useState("");

    const[isAddModalOpen, setIsAddModalOpen] = useState(false);
    const[clientsList, setClientsList] = useState([]);

    const role = localStorage.getItem('role_name');
    const permissions = JSON.parse(localStorage.getItem('permissions') || "[]");

    const columns = [
        {
            header: 'Client',
            className: 'pl-1 sm:pl-4',
            render: (account) => (
                <>
                    {account.client_name}
                </>
            )
        },
        {
            header: 'Account №',
            className: 'pl-1 sm:pl-4',
            render: (account) => (
                <span className="font-mono text-xs tracking-wider text-mauve-600">
                    •••• {account.account_number.slice(-4)}
                </span>
            )
        },
        {
            header: 'Currency',
            className: 'pl-1 sm:pl-4 font-mono font-semibold text-xs text-mauve-500',
            render: (account) => (
                <>
                    {account.currency}
                </>
            )
        },
        {
            header: 'Balance',
            className: 'pl-1 sm:pl-4 text-sm font-bold text-mauve-900',
            render: (account) => (
                <>
                    {formatCurrency(account.balance, account.currency)}
                </>
            )
        },
        {
            header: 'Status',
            className: 'pl-1 sm:text-center',
            render: (account) => (
                <>
                    <div className="pl-1 flex justify-end md:justify-center">
                        <span className="inline-flex items-center gap-2 justify-center w-28 px-2.5 py-1 rounded-full bg-mauve-600 text-mauve-50 text-[10px] font-bold tracking-wider uppercase shrink-0 shadow-sm border border-mauve-700/30">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                                account.status === "FROZEN" ?
                                'bg-cyan-400' :
                                'bg-emerald-400'
                            }`} />
                            {account.status}
                        </span>
                    </div>
                </>
            )
        },
        {
            header: 'Creation date',
            className: 'pl-1 sm:pl-3 text-start text-xs text-mauve-500',
            render: (account) => (
                <>
                    {new Date(account.created_at).toLocaleDateString('uk-UA')}
                </>
            )
        },
        {
            header: 'Actions',
            className: 'pl-1 sm:pl-4',
            render: (account) => (
                <>
                    <AccessGuard permission="freeze_account">
                        <button
                            onClick={() => toggleAccountStatus(account.id, account.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer border ${
                                account.status === "ACTIVE" 
                                ? "bg-white text-mauve-600 border-mauve-200 hover:bg-mauve-50 hover:text-mauve-700" 
                                : "bg-mauve-100 text-mauve-800 hover:bg-mauve-200 border border-mauve-300"
                            }`}
                        >
                            { account.status === "ACTIVE" ? "Freeze" : "Activate" }
                        </button>
                    </AccessGuard>
                </>
            )
        }
    ]

    const getVisibleColumns = () => {
        if (role === 'Super Admin' || permissions.includes('freeze_account')) {
            return columns;
        }
        return columns.filter(col => col.header != 'Actions');
    }

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await apiClient.get('clients/');
                setClientsList(response.data.results || response.data);
            } catch (error) {
                console.error("Failed to load clients list: ", error);
            }
        }
        fetchClients();
    }, []);

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
        const delayDebounceFn = setTimeout(() =>{
            fetchAccounts();
        }, 500);
        return () => clearTimeout(delayDebounceFn)
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

    const handleAddAccount = async (accountData) => {
        try {
            const response = await apiClient.post('accounts/', accountData);
            setAccounts(prevAccounts => [response.data, ...prevAccounts]);
        } catch (error) {
            console.error("Failed to create an account: ", error);
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

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-mauve-100 min-h-full">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6 w-full">
                <div className="flex items-center justify-between lg:justify-start gap-4 w-full lg:w-auto shrink-0">
                    <h2 className="text-xl font-bold text-mauve-900 tracking-tight">
                        Bank accounts
                    </h2>
                    {!loading && accounts.length !== 0 && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-mauve-700 hover:bg-mauve-600 text-indigo-50 text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-sm whitespace-nowrap cursor-pointer"
                        >
                            + Open Account
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col lg:grid-cols-2 xl:flex-row gap-4 w-full lg:flex-1 lg:justify-between items-stretch sm:items-center lg:pl-12 xl:pl-32">
                    <div className="relative w-full sm:w-72 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-mauve-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, surname..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-mauve-300 rounded-xl text-xs text-mauve-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-mauve-400"
                        />
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 w-full sm:w-auto shrink-0">
                        <div className="flex flex-1 sm:flex-none items-center gap-2 min-w-120px">
                            <span className="text-xs font-mono font-bold text-mauve-400 uppercase tracking-wider">Currency:</span>
                            <select
                                value={currencyFilter}
                                onChange={handleCurrencyChange}
                                className="w-full bg-white border border-mauve-200 text-mauve-700 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-2 outline-none cursor-pointer hover:bg-mauve-50 transition duration-300"
                            >
                                <option value="">All</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="UAH">UAH</option>
                            </select>
                        </div>
                        
                        <button
                            onClick={toggleFrozenFilter}
                            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                                filterFrozen 
                                    ? "bg-mauve-700 text-indigo-50 border-mauve-700 shadow-sm"
                                    : "bg-white text-mauve-600 border border-mauve-200 hover:bg-mauve-50"
                            }`}
                        >
                            <FiFilter size={16} />
                            <span className="text-xs font-semibold whitespace-nowrap">{filterFrozen ? 'Show all' : 'Only frozen'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <Table 
                    columns={getVisibleColumns()} 
                    data={accounts} 
                    loading={loading}
                    page={page}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    onNext={() => setPage((prev) => prev + 1)}
                    onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
                />
            </div>
            
            <AddAccountModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddAccount}
                clients={clientsList}
            />
        </div>
    )
}

export default Accounts;