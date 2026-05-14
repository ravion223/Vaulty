import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiSearch, FiX } from 'react-icons/fi';
import apiClient from '../src/api/client';

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
        const timeoutId = setTimeout(() => {
            fetchClients()
        }, 500);
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
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2>Open New Account</h2>
                    <button onClick={onClose} className="pb-3 text-gray-400 hover:text-red-500 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    
                    <input type='hidden' {...register("client")}/>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                        {selectedClient ? (
                            <div className='flex justify-between items-center w-full px-3 py-2 border border-emerald-500 bg-emerald-50 rounded-lg text-emerald-900 font-medium'>
                                <span>{selectedClient.first_name} {selectedClient.last_name}</span>
                                <button
                                    type='button'
                                    onClick={handleClearSection}
                                    className="text-emerald-600 hover:text-emerald-800 transition-colors"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FiSearch className='text-gray-400' />
                                </div>
                                <input 
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white'
                                    placeholder='Search by name, email ...'
                                    autoComplete='off'
                                />

                                {isDropdownOpen && searchQuery.trim != "" && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {isSearching ? (
                                            <li className="px-4 py-3 text-sm text-gray-500 text-center">
                                                Searching...
                                            </li>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(client => (
                                                <li
                                                    key={client.id}
                                                    onClick={() => handleSelectClient(client)}
                                                    className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-900">{client.first_name} {client.last_name}</div>
                                                    <div className="text-xs text-gray-500 flex gap-2">
                                                        <span>TIN: {client.tax_number}</span>
                                                        <span>•</span>
                                                        <span>{client.email}</span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-4 py-3 text-sm text-gray-500 text-center">No clients found</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                        {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Currency</label>
                        <select 
                            {...register("currency")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="UAH">UAH - Ukrainian Hryvnia</option>
                        </select>
                        {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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