import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiX, FiSearch } from 'react-icons/fi';
import apiClient from '../api/client'

const transactionSchema = z.object({
    sender: z.coerce.string().min(1, "Please select sender account"),
    receiver: z.coerce.string().min(1, "Please select receiver account"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
}).refine((data) => data.sender !== data.receiver, {
    message: "Sender and receiver accounts cannot be the same",
    path: ["receiver"],
});

const AccountSearchInput = ({ label, selectedAccount, onSelect, onClear, error }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchAccount = async () => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await apiClient.get(`accounts/?search=${searchQuery}`);
                setResults(response.data.results || response.data);
                setIsOpen(true);
            } catch (error) {
                console.error("Error fetching clients: ", error)
            } finally {
                setIsSearching(false);
            }
        }
        const timeoutId = setTimeout(fetchAccount, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <div className='relative'>
            <label className='block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1'>{label}</label>

            {selectedAccount ? (
                <div className='flex justify-between items-center w-full px-4 py-2.5 border border-indigo-300 bg-indigo-50/40 rounded-xl text-mauve-900 font-semibold shadow-sm animate-fadeIn'>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm truncate">{selectedAccount.client_name}</span>
                        <div className="text-[10px] text-indigo-600 font-mono mt-0.5 flex gap-2 items-center flex-wrap">
                            <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide">
                                {selectedAccount.currency}
                            </span>
                            <span className="tracking-wider">•••• {selectedAccount.account_number?.slice(-4)}</span>
                            {selectedAccount.balance !== undefined && (
                                <>
                                    <span className="text-indigo-300">•</span>
                                    <span className="text-mauve-500 font-sans">Bal: {Number(selectedAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        type='button'
                        onClick={onClear}
                        className='text-indigo-400 hover:text-red-500 p-1 rounded-md hover:bg-indigo-100/60 transition-all cursor-pointer shrink-0 ml-2'
                    >
                        <FiX size={16} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                        <FiSearch className='text-mauve-400' />
                    </div>
                    <input 
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-mauve-200 rounded-xl text-sm text-mauve-800 bg-mauve-50/10 placeholder:text-mauve-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Search by client name or account №..."
                        autoComplete="off"
                    />
                    {isOpen && searchQuery.trim() !== "" && (
                        <ul className="absolute z-50 w-full mt-1.5 bg-white border border-mauve-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-mauve-50">
                            {isSearching ? (
                                <li className="px-4 py-3 text-xs font-mono font-medium text-mauve-400 text-center animate-pulse">
                                    Searching...
                                </li>
                            ) : results.length > 0 ? (
                                results.map(acc => (
                                    <li
                                        key={acc.id}
                                        onClick={() => {
                                            onSelect(acc);
                                            setSearchQuery("");
                                            setIsOpen(false);
                                        }}
                                        className="px-4 py-2.5 hover:bg-mauve-50 cursor-pointer transition-colors duration-150"
                                    >
                                        <div className="font-semibold text-sm text-mauve-900">
                                            {acc.client_name}
                                        </div>
                                        <div className="text-[10px] text-mauve-400 font-mono flex gap-2 mt-0.5 items-center">
                                            <span className="text-mauve-700 font-bold">{acc.currency}</span>
                                            <span>•</span>
                                            <span>№ {acc.account_number}</span>
                                            <span>•</span>
                                            <span className="text-mauve-500 font-sans font-medium">
                                                Bal: {Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </li>
                                    ))
                            ) : (
                                <li className="px-4 py-3 text-xs font-mono text-mauve-400 text-center">
                                    No records found
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
            {error && <p className='text-red-500 text-xs mt-1"'>{error.message}</p>}
        </div>
    );
};

const AddTransactionModal = ({ isOpen, onClose, onAdd }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
        setValue,
        clearErrors
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: { amount : "" }
    });

    const [senderAcc, setSenderAcc] = useState(null);
    const [receiverAcc, setReceiverAcc] = useState(null);

    const onSubmit = async (data) => {
        try {
            await onAdd(data);
            reset();
            handleClose();
        } catch (error) {
            if (error.response && error.response.data) {
                const backendErrors = error.response.data;
                Object.keys(backendErrors).forEach((field) => {
                    if (backendErrors[field] && Array.isArray(backendErrors[field])) {
                        setError(field, { type: "server", message: backendErrors[field][0] })
                    }
                });
            } else {
                console.error("Unknown error: ", error);
            }
        }
    }

    const handleClose = () => {
        setSenderAcc(null);
        setReceiverAcc(null);
        onClose();
}
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="px-6 py-4 bg-white rounded-2xl w-full max-w-md shadow-2xl border border-mauve-100/50 overflow-hidden transition-all">
                <div className="border-b border-mauve-100 flex justify-between items-center bg-white">
                    <h2 className='text-lg font-bold text-mauve-900 tracking-tight'>New Transfer</h2>
                    <button onClick={handleClose} className="pb-3 text-mauve-400 hover:text-red-600 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <input type="hidden" {...register("sender")} />
                    <input type="hidden" {...register("receiver")} />

                    <AccountSearchInput 
                        label="From (Sender)"
                        selectedAccount={senderAcc}
                        error={errors.sender}
                        onSelect={(acc) => {
                            setSenderAcc(acc);
                            setValue("sender", acc.id, { shouldValidate: true });
                            clearErrors("sender");
                        }}
                        onClear={() => {
                            setSenderAcc(null);
                            setValue("sender", "");
                        }}
                    />

                    <AccountSearchInput 
                        label="To (Receiver)"
                        selectedAccount={receiverAcc}
                        error={errors.receiver}
                        onSelect={(acc) => {
                            setReceiverAcc(acc);
                            setValue("receiver", acc.id, { shouldValidate: true });
                            clearErrors("receiver");
                        }}
                        onClear={() => {
                            setReceiverAcc(null);
                            setValue("receiver", "");
                        }}
                    />

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">Amount</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-mauve-500 font-medium">
                                    {senderAcc?.currency === "USD" ? "$" : senderAcc?.currency === "EUR" ? "€" : senderAcc?.currency === "UAH" ? "₴" : '$'}
                                </span>
                            </div>
                            <input 
                                type="number" 
                                step="0.01"
                                {...register("amount")}
                                className="w-full pl-8 pr-4 py-2 border border-mauve-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-mauve-100 mt-6">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-mauve-700 bg-,auve-50 hover:bg-mauve-100 rounded-xl transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-mauve-700 hover:bg-mauve-600 rounded-xl disabled:opacity-50 transition-all">
                            {isSubmitting ? 'Processing...' : 'Transfer Money'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddTransactionModal;