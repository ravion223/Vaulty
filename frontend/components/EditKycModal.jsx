import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiX, FiAlertTriangle } from 'react-icons/fi';

const EditKycModal = ({ isOpen, onClose, client, onUpdate }) => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
        reset
    } = useForm();

    useEffect(() => {
        if (client) {
            reset({ kyc_status: client.kyc_status });
        }
    }, [client, reset]);

    const onSubmit = async (data) => {
        try {
            await onUpdate(client.id, data.kyc_status);
            onClose();
        } catch (error) {
            console.error("Failed to update KYC status: ", error);
            alert("Failed to update KYC status. Check console");
        }
    };

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2>
                        Update KYC Status
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors pb-3">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex gap-3 items-start text-sm">
                        <FiAlertTriangle className="mt-0.5 shrink-0" size={16} />
                        <p>You are about to change the legal verification status for <strong>{client.first_name} {client.last_name}</strong>.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            {...register("kyc_status")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                            <option value="PENDING">Pending (Awaiting documents)</option>
                            <option value="APPROVED">Approved (Verified)</option>
                            <option value="REJECTED">Rejected (Failed verification)</option>
                        </select>
                    </div>

                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditKycModal;