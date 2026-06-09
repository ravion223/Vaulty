import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiX } from 'react-icons/fi';

// Validation scheme

const clientSchema = z.object({
    first_name: z.string().min(2, "Name has to contain at least 2 symbols"),
    last_name: z.string().min(2, "Surname has to contain at least 2 symbols"),
    tax_number: z.string()
        .length(9, "SSN/TIN has to contain 9 numbers")
        .regex(/^\d+$/, "Tax number has to contain only numbers"),
    email: z.string().email("Wrong email adress format"),
    phone_number: z.string().min(10, "Phone number is too short"),
    kyc_status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

const AddClientModal = ({ isOpen, onClose, onAdd }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError
    } = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            kyc_status: 'PENDING',
            risk_level: 'LOW'
        }
    });

    const onSubmit = async (data) => {
        try {
            await onAdd(data);
            reset();
            onClose();
        } catch (error) {
            if (error.response && error.response.data){
                const backendErrors = error.response.data;

                Object.keys(backendErrors).forEach((field) => {
                    if (backendErrors[field] && Array.isArray(backendErrors[field])) {
                        setError(field, {
                            type: "server",
                            message: backendErrors[field][0]
                        });
                    }
                })
            } else {
                console.log("Unknown error:", error);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl w-full max-w-md shadow-2xl border border-mauve-100/50 overflow-hidden transition-all'>
                <div className='px-6 py-4 border-b border-mauve-100 flex justify-between items-center bg-white'>
                    <h2 className='text-lg font-bold text-mauve-900 tracking-tight'>Add New Client</h2>
                    <button onClick={onClose} className='pb-3 text-mauve-400 hover:text-red-500 transition-colors'>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">First Name</label>
                            <input
                                {...register("first_name")}
                                className="w-full px-3 text-sm py-2 border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-mauve-400"
                                placeholder='John'
                            />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">Last Name</label>
                            <input
                                {...register("last_name")}
                                className="w-full px-3 py-2 text-sm border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-mauve-400"
                                placeholder='Doe'
                            />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">Email</label>
                        <input 
                            {...register("email")}
                            type="email"
                            className="w-full px-3 py-2 text-sm border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-mauve-400"
                            placeholder='john.doe@example.com'
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">Phone number</label>
                        <input 
                            {...register("phone_number")}
                            className="w-full px-3 py-2 text-sm border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-mauve-400"
                            placeholder='+1 234 567 8900'
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">Tax number</label>
                        <input 
                            {...register("tax_number")}
                            className="w-full px-3 py-2 text-sm border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-mauve-400"
                            placeholder='123456789'
                        />
                        {errors.tax_number && <p className="text-red-500 text-xs mt-1">{errors.tax_number.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">KYC status</label>
                        <select 
                            {...register("kyc_status")}
                            className="w-full px-3 py-2 text-sm border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white "
                        >
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        {errors.kyc_status && <p className="text-red-500 text-xs mt-1">{errors.kyc_status.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-mauve-500 font-mono mb-1.5 mt-1">Risk level</label>
                        <select 
                            {...register("risk_level")}
                            className="w-full px-3 py-2 text-sm border border-mauve-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        {errors.risk_level && <p className="text-red-500 text-xs mt-1">{errors.risk_level.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-mauve-100 mt-6">
                        <button
                            type='button'
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-mauve-700 bg-mauve-50 hover:bg-mauve-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-mauve-700 hover:bg-mauve-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? "Creating..." : "Create Client"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default AddClientModal;