import React, { useState } from 'react';
import Dashboard from './Dashboard';
import FlaggedTransactionsDashboard from './FlaggedTransactionsDashboard';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="space-y-6">
            {/* Header & pages switch */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-mauve-100 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-mauve-900">Analytics Hub</h2>
                    <p className="text-mauve-500 text-sm">Monitor business metrics and security alerts.</p>
                </div>

                <div className="flex space-x-1 bg-mauve-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-sm rounded-md font-medium transition ${
                            activeTab === 'overview' 
                            ? 'bg-white text-mauve-900 shadow-sm' 
                            : 'text-mauve-600 hover:text-mauve-900 hover:bg-mauve-200'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('fraud')}
                        className={`px-4 py-2 text-sm rounded-md font-medium transition flex items-center gap-2 ${
                            activeTab === 'fraud' 
                            ? 'bg-white text-red-600 shadow-sm' 
                            : 'text-mauve-600 hover:text-red-600 hover:bg-mauve-200'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Fraud Radar
                    </button>
                </div>
            </div>

            {/* Рендеринг активного дашборду */}
            <div className="mt-6">
                {activeTab === 'overview' ? <Dashboard /> : <FlaggedTransactionsDashboard />}
            </div>
        </div>
    );
};

export default DashboardPage;