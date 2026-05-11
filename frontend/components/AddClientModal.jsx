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
        reset
    } = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            kyc_status: 'PENDING',
            risk_level: 'LOW'
        }
    });

    const onSubmit = async (data) => {
        await onAdd(data);
        reset();
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div>
            <div>
                <div>
                    <h2>Add New CLient</h2>
                    <button onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                {...register("first_name")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder='John'
                            />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                {...register("last_name")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder='Doe'
                            />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            {...register("email")}
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder='john.doe@example.com'
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                        <input 
                            {...register("phone_number")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder='+1 234 567 8900'
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax number</label>
                        <input 
                            {...register("tax_number")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder='123456789'
                        />
                        {errors.tax_number && <p className="text-red-500 text-xs mt-1">{errors.tax_number.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">KYC status</label>
                        <select 
                            {...register("kyc_status")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        {errors.kyc_status && <p className="text-red-500 text-xs mt-1">{errors.kyc_status.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Risk level</label>
                        <select 
                            {...register("risk_level")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        {errors.risk_level && <p className="text-red-500 text-xs mt-1">{errors.risk_level.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                        <button
                            type='button'
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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