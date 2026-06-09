import React from 'react';

const ResolveFraudModal = ({ isOpen, onClose, selectedAlert, isProcessing, onUpdate }) => {
    const onSubmit = async (data) => {
        try {
            await onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update transaction: ", error);
            alert("Failed to update transaction. Check console");
        }
    };

    if (!isOpen || !selectedAlert) return null;

    return (
        <>
            {isOpen && selectedAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-mauve-900 tracking-tight">
                            Confirm Action
                        </h3>
                        <p className="text-mauve-600 text-sm mb-6 mt-1.5">
                            Are you sure you want to mark transaction <span className="font-mono font-bold">{selectedAlert.transaction_id}</span> as safe? This will remove the fraud flag and allow the transaction to proceed.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isProcessing}
                                className="px-4 py-2 text-sm font-medium text-mauve-600 bg-mauve-100 rounded-lg hover:bg-mauve-200 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSubmit}
                                disabled={isProcessing}
                                className="px-4 py-2 text-sm font-medium text-white bg-mauve-700 rounded-lg hover:bg-mauve-600 transition-all disabled:opacity-50 flex items-center"
                            >
                                {isProcessing ? 'Processing...' : 'Yes, Mark Safe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
        
    )
}

export default ResolveFraudModal;