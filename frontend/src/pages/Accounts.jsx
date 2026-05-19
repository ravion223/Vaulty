import { useState, useEffect } from 'react';
import apiClient from '../api/client'
import { FiAlertCircle, FiFilter, FiSearch } from "react-icons/fi";
import { FaCircleCheck, FaFlag } from "react-icons/fa6";
import AddAccountModal from '../components/AddAccountModal';
import Table from '../components/Table';

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

    const columns = [
        {
            header: 'Client',
            className: 'text-mauve-800 font-medium',
            render: (account) => (
                <>
                    {account.client_name}
                </>
            )
        },
        {
            header: 'Account №',
            className: 'pl-1 text-mauve-600',
            render: (account) => (
                <>
                    •••• {account.account_number.slice(-4)}
                </>
            )
        },
        {
            header: 'Currency',
            className: 'pl-1 text-mauve-600',
            render: (account) => (
                <>
                    {account.currency}
                </>
            )
        },
        {
            header: 'Balance',
            className: 'pl-1 text-sm font-bold text-mauve-900',
            render: (account) => (
                <>
                    {formatCurrency(account.balance, account.currency)}
                </>
            )
        },
        {
            header: 'Status',
            className: 'pl-1 text-center',
            render: (account) => (
                <>
                    <div className="pl-1 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            account.status === "FROZEN" ?
                            'bg-cyan-100 text-cyan-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                            {account.status}
                        </span>
                    </div>
                </>
            )
        },
        {
            header: 'Creation date',
            className: 'pl-1 text-center',
            render: (account) => (
                <>
                    {new Date(account.created_at).toLocaleDateString('uk-UA')}
                </>
            )
        },
        {
            header: 'Actions',
            className: '',
            render: (account) => (
                <>
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
                </>
            )
        }
    ]

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
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-mauve-900 font-stretch-expanded">
                        Bank accounts
                    </h2>
                    {!loading && accounts.length !== 0 && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors duration-300 shadow-sm whitespace-nowrap"
                        >
                            + Open Account
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
                <div>
                    <Table 
                        columns={columns} 
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