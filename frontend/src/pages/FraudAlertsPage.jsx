import React, { useState, useEffect } from 'react';
import apiClient from "../api/client";
import ResolveFraudModal from '../components/ResolveFraudModal';
import { FiAlertTriangle, FiArrowRight, FiActivity, FiDollarSign } from 'react-icons/fi';
import { HiShieldCheck } from "react-icons/hi";

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
                let url = `flagged-transactions/?page=${page}`
                const response = await apiClient.get(url);
                setAlerts(response.data.results || response.data);
                setHasNext(response.data.next !== null);
                setHasPrevious(response.data.previous !== null);
            } catch (error) {
                console.error("Error fetching alerts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, [page]);

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

    const activeAlertsCount = alerts.length;
    const totalRiskAmount = alerts.reduce((sum, item) => sum + Number(item.amount), 0);

    const getQueuePriority = (count) => {
        if (count === 0) {
            return {
                text: 'LOW',
                textColor: 'text-emerald-600',
                bgColor: 'bg-emerald-50'
            }
        }
        if (count <= 5) {
            return {
                text: 'MEDIUM',
                textColor: 'text-amber-600',
                bgColor: 'bg-amber-50'
            }
        }
        return {
            text: 'CRITICAL',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    }

    const priority = getQueuePriority(activeAlertsCount)

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border-mauve-100 min-h-full">
            {/* <div className="flex justify-between items-center"> */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
                <div>
                    <h2 className="flex items-center gap-2 font-stretch-expanded">
                        <FiAlertTriangle className="text-red-500 animate-pulse" />
                        Fraud Alerts Queue
                    </h2>
                    <p className='text-sm font-mono mt-1'>
                        Real-time high-risk transactions requiring manual override or resolution
                    </p>                    
                </div>

                {/* METRICS PANEL */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='bg-white p-5 rounded-xl shadow-sm border border-mauve-200 flex items-center gap-4'>
                        <div className='p-3 bg-red-50 text-red-600 rounded-lg'>
                            <FiActivity size={24} className='animate-pulse' />
                        </div>
                        <div>
                            <p className='text-xs font-mono font-bold text-mauve-400 uppercase tracking-wider'>
                                Active Threats
                            </p>
                            <h4 className='text-2xl font-bold font-mono text-mauve-900 mt-1'>
                                {loading ? '...' : activeAlertsCount}
                            </h4>
                        </div>
                    </div>

                    <div className='bg-white p-5 rounded-xl shadow-sm border border-mauve-200 flex items-center gap-4'>
                        <div className='p-3 bg-amber-50 text-amber-600 rounded-lg'>
                            <FiDollarSign size={24} />
                        </div>
                        <div>
                            <p className='text-xs font-mono font-bold text-mauve-400 uppercase tracking-wider'>
                                Funds Under Exposure
                            </p>
                            <h4 className='text-2xl font-bold font-mono text-mauve-900 mt-1'>
                                {loading ? '...' : `$${totalRiskAmount.toLocaleString('en-US', {maximumFractionDigits: 0})}`}
                            </h4>
                        </div>
                    </div>

                    <div className='bg-white p-5 rounded-xl shadow-sm border border-mauve-200 flex items-center gap-4'>
                        <div className={`p-3 rounded-lg ${priority.bgColor} ${priority.textColor}`}>
                            <HiShieldCheck size={24} />
                        </div>
                        <div>
                            <p className='text-xs font-mono font-bold text-mauve-400 uppercase tracking-wider'>
                                Queue Priority
                            </p>
                            <h4 className={`text-2xl font-bold font-mono ${priority.textColor} mt-1`}>
                                {loading ? '...' : priority.text}
                            </h4>
                        </div>
                    </div>
                </div>    
            </div>

            {/* INCIDENT FEED */}
            <div className='space-y-4'>
                {loading ? (
                    <div className='space-y-4 animate-pulse'>
                        {[1, 2, 3].map((n) => (
                            <div key={n} className='bg-white h-24 rounded-xl border border-mauve-200'></div>
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-mauve-200 shadow-sm">
                        <div className="bg-emerald-50 p-4 rounded-full mb-4 text-emerald-600">
                            <HiShieldCheck size={36} />
                        </div>
                        <h3 className="text-lg font-bold font-mono text-mauve-900 mb-1">Queue is Clear</h3>
                        <p className="text-sm text-mauve-500 max-w-sm font-mono">
                            No suspicious activities detected by PySpark engine. Excellent job!
                        </p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {alerts.map((alert, index) => (
                            <div
                                key={alert.transaction_id || index}
                                className='bg-white rounded-xl border border-mauve-200
                                shadow-sm hover:shadow-md transition duration-300 border-l-4
                                border-l-red-500 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4'
                            >
                                {/* LEFT SIDE */}
                                <div className='space-y-1'>
                                    <div className='flex items-center gap-2'>
                                        <span className='inline-block w-2 h-2 rounded-full bg-red-500 animate-ping'></span>
                                        <span className='text-xs font-mono font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded'>
                                            {alert.status || 'SUSPICIOUS'}
                                        </span>
                                        <span>
                                            ID: {alert.transaction_id}
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-2 font-mono text-sm text-mauve-800 pt-1'>
                                        <span className='bg-mauve-100 px-2 py-0.5 rounded text-xs'>
                                            {alert.account_from}
                                        </span>
                                        <FiArrowRight className='text-mauve-400'/>
                                        <span className='bg-mauve-100 px-2 py-0.5 rounded text-xs'>
                                            {alert.account_to}
                                        </span>
                                    </div>
                                </div>

                                {/* RIGHT SIDE */}
                                <div className='flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-mauve-100'>
                                    <div className='text-left md:text-right font-mono'>
                                        <p className='text-xs text-mauve-400 font-bold uppercase'>
                                            Impact Amount
                                        </p>
                                        <p className='text-lg font-bold text-red-600 mt-0.5'>
                                            ${Number(alert.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className='text-[10px] text-mauve-400 mt-0.5'>
                                            {new Date(alert.timestamp).toLocaleString('uk-UA')}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedAlert(alert);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50
                                        hover:bg-emerald-600 hover:text-white border-emerald-200
                                        px-4 py-2 rounded-lg transition duration-300 shadow-sm"
                                    >
                                        Dismiss Alert
                                    </button>
                                </div> 
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PAGINATION FOOTER */}
            {!loading && alerts.length > 0 && (
                <div className='flex items-center justify-between border-t border-mauve-200 pt-4 mt-6'>
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={!hasPrevious}
                        className='px-4 py-2 text-xs font-mono font-bold text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200'
                    >
                        Previous
                    </button>
                    <span className='text-xs font-mono text-mauve-500 font-medium'>
                        Page {page}
                    </span>
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev + 1))}
                        disabled={!hasNext}
                        className='px-4 py-2 text-xs font-mono font-bold text-mauve-700 bg-white border border-mauve-200 rounded-lg hover:bg-mauve-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200'
                    >
                        Next
                    </button>
                </div>
            )}
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