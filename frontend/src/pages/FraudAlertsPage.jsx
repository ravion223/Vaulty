import React, { useState, useEffect } from 'react';
import apiClient from "../api/client";
import Table from '../components/Table';
import ResolveFraudModal from '../components/ResolveFraudModal';

const FraudAlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect (() => {
        const fetchAlerts = async () => {
            try {
                const response = await apiClient.get("flagged-transactions");
                setAlerts(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching alerts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, [])

    const columns = [
        {
            header: 'TX ID',
            className: '',
            render: (alert) => (
                <>
                    <p className='font-mono text-xs text-mauve-600'>{alert.transaction_id}</p>
                </>
            )
        },
        {
            header: 'Participants',
            className: '',
            render: (alert) => (
                <>
                <div className='font-mono text-sm'>
                    {alert.account_from} → {alert.account_to}
                </div>
                </>
            )
        },
        {
            header: 'Amount',
            className: '',
            render: (alert) => (
                <>
                    <span className="font-bold text-red-600">
                        ${Number(alert.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </>
            )
        },
        {
            header: 'Status',
            className: '',
            render: (alert) => (
                <>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 uppercase">
                        {alert.status}
                    </span>
                </>
            )
        },
        {
            header: 'Timestamp',
            className: '',
            render: (alert) => (
                <span className="text-sm text-mauve-500">
                    {new Date(alert.timestamp).toLocaleString('uk-UA')}
                </span>
            )
        },
        {
            header: 'Action',
            className: '',
            render: (alert) => (
                <button
                    onClick={() => {
                        setSelectedAlert(alert);
                        setIsModalOpen(true);
                    }}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md transition duration-200"
                >
                    Resolve
                </button>
            )
        }
    ]

    const handleResolveTransaction = async () => {
        if (!selectedAlert) return;
        setProcessing(true);

        try {
            await apiClient.patch(`flagged-transactions/${selectedAlert.transaction_id}/`, {
                is_flagged: false
            })
            setAlerts((prevAlerts) => 
                prevAlerts.filter((alert) => alert.transaction_id !== selectedAlert.transaction_id)
            );
        } catch (error) {
            console.error ("Error updating transaction:", error)
            alert("Failed to update transaction status.");
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            {/* <div className="flex justify-between items-center"> */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
                <div className='flex flex-col'>
                    <h2 className="font-stretch-expanded">
                        Fraud Alerts Queue
                    </h2>                    
                </div>    
            </div>

            <div>
                <Table 
                    columns={columns} 
                    data={alerts}
                    loading={loading}
                    page={page}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    onNext={() => setPage((prev) => prev + 1)}
                    onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
                />
            </div>
            <ResolveFraudModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedAlert={selectedAlert}
                isProcessing={processing}
                onUpdate={handleResolveTransaction}
            />
        </div>
    )
}

export default FraudAlertsPage;