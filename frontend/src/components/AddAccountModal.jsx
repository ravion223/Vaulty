import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiSearch, FiX } from 'react-icons/fi';
import apiClient from '../api/client';

const accountSchema = z.object({
    client: z.string().min(1, "Please select a client"),
    currency: z.enum(['UAH', 'EUR', 'USD'])
});

const AddAccountModal = ({ isOpen, onClose, onAdd }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
        setValue,
        clearErrors
    } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            currency: 'USD'
        }
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            if (!searchQuery.trim()){
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const response = await apiClient.get(`clients/?search=${searchQuery}`);
                setSearchResults(response.data.results);
                setIsDropdownOpen(true);
            } catch (error) {
                console.error("Error search clients: ", error)
            } finally {
                setIsSearching(false);
            }
        };
        const timeoutId = setTimeout(fetchClients, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const onSubmit = async (data) => {
        try {
            await onAdd(data);
            reset();
            onClose();
        } catch (error) {
            if (error.response && error.response.data) {
                const backendErrors = error.response.data;
                Object.keys(backendErrors).forEach((field) => {
                    if (backendErrors[field] && Array.isArray(backendErrors[field])) {
                        setError(field, {
                            type: "server",
                            message: backendErrors[field][0]
                        });
                    } else {
                        console.error("Unknown error:", error)
                    }
                })
            }
        }
};
    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setValue("client", client.id, { shouldValidate: true });
        clearErrors("client");
        setSearchQuery("");
        setIsDropdownOpen(false);
    };

    const handleClearSection = () => {
        setSelectedClient(null);
        setValue("client", "");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="px-6 py-4 bg-white rounded-2xl w-full max-w-md shadow-2xl border border-mauve-100/50 overflow-hidden transition-all">
                
                <div className="border-b border-mauve-100 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-bold text-mauve-900 tracking-tight">Open New Account</h2>
                    <button onClick={onClose} className="p-1.5 text-mauve-400 hover:text-red-500 rounded-lg hover:bg-mauve-50 transition-all duration-200 cursor-pointer">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    
                    <input type='hidden' {...register("client")}/>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5">Select Client</label>
                        {selectedClient ? (
                            <div className='flex justify-between items-center w-full px-4 py-2.5 border border-indigo-300 bg-indigo-50/40 rounded-xl text-mauve-900 font-semibold shadow-sm animate-fadeIn'>
                                <div className='flex flex-col min-w-0 flex-1'>
                                    <span className='text-sm'>{selectedClient.first_name} {selectedClient.last_name}</span>
                                <span className="text-[10px] text-indigo-600 font-mono mt-0.5">TIN: {selectedClient.tax_number}</span>
                                </div>
                                
                                <button
                                    type='button'
                                    onClick={handleClearSection}
                                    className="text-indigo-400 hover:text-red-500 p-1 rounded-md hover:bg-indigo-100/60 transition-all cursor-pointer shrink-0 ml-2"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FiSearch className='text-mauve-400' />
                                </div>
                                <input 
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full pl-10 pr-4 py-2 text-sm border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-mauve-400'
                                    placeholder='Search by name, email ...'
                                    autoComplete='off'
                                />

                                {isDropdownOpen && searchQuery.trim != "" && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-mauve-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {isSearching ? (
                                            <li className="px-4 py-3 text-xs font-mono font-medium text-mauve-400 text-center animate-pulse">
                                                Searching...
                                            </li>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(client => (
                                                <li
                                                    key={client.id}
                                                    onClick={() => handleSelectClient(client)}
                                                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-mauve-50 last:border-0 transition-colors"
                                                >
                                                    <div className="font-semibold text-sm text-mauve-900">{client.first_name} {client.last_name}</div>
                                                    
                                                    <div className="text-[10px] text-mauve-400 font-mono flex gap-2 mt-0.5 items-center">
                                                        <span className="text-mauve-700 font-bold">TIN: {client.tax_number}</span>
                                                        <span>•</span>
                                                        <span>{client.email}</span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-4 py-3 text-sm text-mauve-500 text-center">No clients found</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                        {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5">Account Currency</label>
                        <select 
                            {...register("currency")}
                            className="w-full px-3 py-2 border border-mauve-300 rounded-xl text-sm font-semibold text-mauve-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer bg-white"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="UAH">UAH - Ukrainian Hryvnia</option>
                        </select>
                        {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-mauve-100 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-mauve-700 bg-mauve-50 hover:bg-mauve-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-4 py-2 text-sm font-medium text-white bg-mauve-700 hover:bg-mauve-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Opening...' : 'Open Account'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default AddAccountModal;