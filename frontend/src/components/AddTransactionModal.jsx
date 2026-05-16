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
            <label>{label}</label>

            {selectedAccount ? (
                <div>
                    <span>{selectedAccount.client_name} (•••• {selectedAccount.account_number?.slice(-4)}) - {selectedAccount.currency}</span>
                    <button
                        type='button'
                        onClick={onClear}
                    >
                        <FiX size={18} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                        <FiSearch className='text-gray-400' />
                    </div>
                    <input 
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Search by client or account №..."
                        autoComplete="off"
                    />
                    {isOpen && searchQuery.trim() !== "" && (
                        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {isSearching ? (
                                <li className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</li>
                            ) : results.length > 0 ? (
                                results.map(acc => (
                                    <li
                                        key={acc.id}
                                        onClick={() => {
                                            onSelect(acc);
                                            setSearchQuery("");
                                            setIsOpen(false);
                                        }}
                                        className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {acc.client_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Acc: {acc.account_number} • {acc.currency} • Bal: {acc.balance}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-3 text-sm text-gray-500 text-center">
                                    No accounts found
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
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-visible">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 >New Transfer</h2>
                    <button onClick={handleClose} className="pb-3 text-gray-400 hover:text-red-600 transition-colors">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium">$</span>
                            </div>
                            <input 
                                type="number" 
                                step="0.01"
                                {...register("amount")}
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'Processing...' : 'Transfer Money'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddTransactionModal;