import React, { useState, useEffect } from 'react';
import apiClient from "../api/client";
import ResolveFraudModal from '../components/ResolveFraudModal';
import { FiAlertTriangle, FiArrowRight, FiActivity, FiDollarSign } from 'react-icons/fi';
import { HiShieldCheck } from "react-icons/hi";
import { GrMoney } from "react-icons/gr";


const FraudAlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currencyFilter, setCurrencyFilter] = useState('USD');

    useEffect (() => {
        const fetchAlerts = async () => {
            try {
                let url = `flagged-transactions/?page=${page}`
                if (currencyFilter) {
                    url += `&currency=${currencyFilter}`;
                }

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
    }, [page, currencyFilter]);

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
                textColor: 'text-emerald-500',
                bgColor: 'bg-emerald-50/60'
            }
        }
        if (count <= 5) {
            return {
                text: 'MEDIUM',
                textColor: 'text-amber-500',
                bgColor: 'bg-amber-50/60'
            }
        }
        return {
            text: 'CRITICAL',
            textColor: 'text-red-500',
            bgColor: 'bg-red-50/60'
        }
    }

    const priority = getQueuePriority(activeAlertsCount)

    const skeletonCards = Array.from({ length: 4 });

    const formatRiskAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyFilter,
            notation: 'compact',
            compactDisplay: 'short'
        }).format(amount);
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-mauve-100 min-h-full">
            {/* <div className="flex justify-between items-center"> */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-mauve-100'>
                <div className='space-y-1'>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-mauve-900 tracking-tight">
                        <FiAlertTriangle className="text-red-500 animate-pulse" />
                        Fraud Alerts Queue
                    </h2>
                    <p className='text-xs text-mauve-400 font-mono font-medium tracking-wide'>
                        Real-time high-risk transactions requiring manual override or resolution
                    </p>                    
                </div>

                <div className='w-full sm:w-auto'>
                    <select
                        value={currencyFilter}
                        onChange={(e) => {
                            setCurrencyFilter(e.target.value);
                            setPage(1);
                        }}
                        className='w-full sm:w-auto bg-white border border-mauve-200 text-mauve-700 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-2.5 shadow-sm font-mono outline-none cursor-pointer transition-all duration-200'
                    >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="UAH">UAH - Hryvnia</option>
                    </select>
                </div>
            </div>

            {/* METRICS PANEL */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full'>
                <div className='w-full overflow-hidden min-w-0 bg-white p-5 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4'>
                    <div className='p-3 bg-red-50 text-red-500 rounded-xl shrink-0'>
                        <FiActivity size={24} className='animate-pulse' />
                    </div>
                    <div className='min-w-0 flex-1'>
                        <p className='text-[10px] font-mono font-bold text-mauve-400 uppercase tracking-wider truncate'>
                            Active Threats
                        </p>
                        <h4 className='text-xl sm:text-2xl font-bold font-mono text-mauve-900 mt-0.5 truncate'>
                            {loading ? '...' : activeAlertsCount}
                        </h4>
                    </div>
                </div>

                <div className='w-full overflow-hidden min-w-0 bg-white p-5 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4'>
                    <div className='p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0'>
                        <GrMoney size={24}/>
                    </div>
                    <div className='min-w-0 flex-1'>
                        <p className='text-[10px] font-mono font-bold text-mauve-400 uppercase tracking-widest truncate'>
                            Funds Under Exposure
                        </p>
                        <h4 
                            className='text-xl sm:text-2xl font-bold font-mono text-mauve-900 mt-0.5 truncate tracking-tight'
                            title={totalRiskAmount}
                        >
                            {loading ? '...' : `${formatRiskAmount(totalRiskAmount)}`}
                        </h4>
                    </div>
                </div>

                <div className='w-full overflow-hidden min-w-0 bg-white p-5 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4 sm:col-span-2 lg:col-span-1'>
                    <div className={`p-3 rounded-xl shrink-0 ${priority.bgColor} ${priority.textColor}`}>
                        <HiShieldCheck size={24} />
                    </div>
                    <div className='min-w-0 flex-1'>
                        <p className='text-[10px] font-mono font-bold text-mauve-400 uppercase tracking-widest truncate'>
                            Queue Priority
                        </p>
                        <h4 className={`text-xl sm:text-2xl font-bold font-mono ${priority.textColor} mt-0.5 truncate`}>
                            {loading ? '...' : priority.text}
                        </h4>
                    </div>
                </div>
            </div>    

            {/* INCIDENT FEED */}
            <div className='space-y-4'>
                {loading ? (
                    <div className='space-y-3'>
                        {skeletonCards.map((_, index) => (
                            <div 
                                key={index} 
                                className='bg-white rounded-xl border border-mauve-100 shadow-sm border-l-4 border-l-mauve-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse'
                            >
                                {/* LEFT SIDE SKELETON */}
                                <div className='space-y-3 w-full md:w-1/2'>

                                    <div className='flex items-center gap-2'>
                                        <div className='w-2 h-2 rounded-full bg-mauve-200'></div>
                                        <div className='h-5 w-20 bg-mauve-100 rounded-lg'></div>
                                        <div className='h-4 w-32 bg-mauve-50 rounded-lg'></div>
                                    </div>
                                    
                                    <div className='flex items-center gap-2 pt-1'>
                                        <div className='h-5 w-24 bg-mauve-100 rounded-lg'></div>
                                        <div className='h-3 w-4 bg-mauve-100 rounded-lg'></div>
                                        <div className='h-5 w-24 bg-mauve-100 rounded-lg'></div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE SKELETON */}
                                <div className='flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-mauve-50 w-full md:w-auto'>
                                    <div className='flex flex-col items-start md:items-end space-y-2'>
                                        <div className='h-3 w-20 bg-mauve-100 rounded'></div>
                                        <div className='h-6 w-28 bg-mauve-200 rounded-lg'></div>
                                        <div className='h-2 w-24 bg-mauve-50 rounded'></div>
                                    </div>
                                    
                                    
                                    <div className='h-9 w-32 bg-mauve-100 rounded-xl md:ml-4'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-mauve-100 shadow-sm">
                        <div className="bg-emerald-50 p-4 rounded-full mb-4 text-emerald-500">
                            <HiShieldCheck size={36} />
                        </div>
                        <h3 className="text-lg font-bold font-mono text-mauve-900 mb-1">Queue is Clear</h3>
                        <p className="text-sm text-mauve-500 max-w-sm font-mono">
                            No suspicious activities detected by PySpark engine.
                        </p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {alerts.map((alert, index) => (
                            <div
                                key={alert.transaction_id || index}
                                className='bg-white rounded-xl border border-mauve-100
                                shadow-sm hover:shadow-md transition-all duration-300 border-l-4
                                border-l-red-500 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4'
                            >
                                {/* LEFT SIDE */}
                                <div className='space-y-1.5'>
                                    <div className='flex items-center gap-2 flex-wrap sm:flex-nowrap'>
                                        
                                        <span className='inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-mauve-600 text-mauve-50 text-[10px] font-bold tracking-wider font-mono uppercase shrink-0 shadow-sm border border-mauve-700/30'>
                                            <span className='w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shrink-0'></span>
                                            {alert.status || 'SUSPICIOUS'}
                                        </span>
                                        <span className="font-mono text-xs font-semibold text-mauve-400">
                                            ID: <span className="text-mauve-800">{alert.transaction_id.slice(0, 8)}...</span>
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-2 font-mono text-xs text-mauve-800 pt-1'>
                                        <span className='bg-mauve-50 border border-mauve-100 text-mauve-600 font-semibold px-2 py-0.5 rounded-md'>
                                            {alert.account_from}
                                        </span>
                                        <FiArrowRight className='text-mauve-400 shrink-0'/>
                                        <span className='bg-mauve-50 border border-mauve-100 text-mauve-600 font-semibold px-2 py-0.5 rounded-md'>
                                            {alert.account_to}
                                        </span>
                                    </div>
                                </div>

                                {/* RIGHT SIDE */}
                                <div className='flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-mauve-100 w-full md:w-auto'>
                                    <div className='text-left md:text-right font-mono'>
                                        <p className='text-[10px] text-mauve-400 font-bold uppercase tracking-wider'>
                                            Impact Amount
                                        </p>
                                        <p className='text-lg font-bold text-red-500 mt-0.5'>
                                            {alert.currency === 'USD' ? '$' : alert.currency === 'EUR' ? '€' : '₴'}
                                            {Number(alert.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                                        className="text-xs font-mono font-bold text-indigo-50 bg-mauve-700
                                        hover:bg-mauve-600 border border-transparent cursor-pointer
                                        px-4 py-2 rounded-xl transition-all duration-300 shadow-sm shrink-0"
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
                <div className='flex flex-col sm:flex-row items-center justify-between border-t border-mauve-100 pt-4 mt-6'>
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={!hasPrevious}
                        className='w-full sm:w-auto px-4 py-2 text-xs font-mono font-bold text-mauve-600 bg-white border border-mauve-200 rounded-xl hover:bg-mauve-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer'
                    >
                        Previous
                    </button>
                    <span className='text-xs font-mono text-mauve-500 font-medium'>
                        Page {page}
                    </span>
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev + 1))}
                        disabled={!hasNext}
                        className='w-full sm:w-auto px-4 py-2 text-xs font-mono font-bold text-mauve-600 bg-white border border-mauve-200 rounded-xl hover:bg-mauve-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer'
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