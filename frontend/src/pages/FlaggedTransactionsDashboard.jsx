import { useState, useEffect } from "react";
import { PieChart, Pie, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import apiClient from "../api/client";

const BarChartSkeleton = () => (
    <>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100">
        <div className="h-8 w-48 rounded-lg bg-mauve-200 mb-6"></div>
        <div className="h-4 w-64 rounded-lg bg-mauve-200 mb-6"></div>

        <div className="h-80 w-full flex flex-col justify-between gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="h-3 bg-mauve-100 rounded w-12 shrink-0"></div> {/* Текст осі Y */}
                    <div className="h-5 bg-mauve-200/70 rounded-r flex-1" style={{ maxWidth: `${90 - i * 12}%` }}></div> {/* Стовпчик */}
                </div>
            ))}
        </div>
    </div>
    </>
)

const PieChartSkeleton = () => (
    <div className="bg-white p-6 rounded-xl border border-mauve-100 shadow-sm flex flex-col">
        <div className="h-5 bg-mauve-200 rounded w-40 mb-6"></div>
        
        <div className="h-80 w-full flex flex-col items-center justify-center">
            
            <div className="w-44 h-44 rounded-full border-24px border-mauve-100/80 bg-transparent animate-pulse mb-6"></div>
            
            <div className="flex justify-center items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-mauve-100"></div>
                    <div className="h-3 bg-mauve-100 rounded w-16"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-mauve-100"></div>
                    <div className="h-3 bg-mauve-100 rounded w-14"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-mauve-100"></div>
                    <div className="h-3 bg-mauve-100 rounded w-20"></div>
                </div>
            </div>

        </div>
    </div>
);

const FlaggedTransactionsDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currencyFilter, setCurrencyFilter] = useState('USD');

    const statusCounts = transactions.reduce((acc, tx) => {
        acc[tx.status || 'Unknown'] = (acc[tx.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
    }))

    useEffect(() => {
        const fetchFraudData = async () => {
            try {
                let url = "flagged-transactions"
                if (currencyFilter) {
                    url += `?currency=${currencyFilter}`;
                }
                const response = await apiClient.get(url);
                setTransactions(response.data.results ? response.data.results : response.data);
            } catch (error) {
                console.error("Error loading fraud stats:", error)
            } finally {
                setLoading(false)
            }
        };
        fetchFraudData();
    }, [currencyFilter]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-mauve-100 shadow-sm">
                    <div>
                        <div className="h-8 bg-mauve-200 rounded w-48 mb-6"></div>
                        <div className="h-4 bg-mauve-200 rounded w-64 mb-6"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BarChartSkeleton />
                    <PieChartSkeleton />
                </div>
            </div>
        )
    }

    const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-mauve-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-mauve-900 font-stretch-expanded">
                        Fraud Radar Analytics
                    </h2>
                    <p className="text-sm text-mauve-500 font-mono mt-0.5">
                        Visual breakdown of high-risk operational anomalies
                    </p>
                </div>
                
                <div className="w-full sm:w-auto">
                    <select
                        value={currencyFilter}
                        onChange={(e) => setCurrencyFilter(e.target.value)}
                        className="w-full sm:w-auto bg-white border border-mauve-200 text-mauve-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 shadow-sm font-mono outline-none cursor-pointer transition duration-200"
                    >
                        <option value="USD">USD - Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="UAH">UAH - Hryvnia</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100">
                    <h3 className="text-lg font-bold text-mauve-900 mb-6">
                        Top Risk Exposures
                    </h3>
                    <p className="text-sm text-mauve-500 mb-6">
                        Largest flagged transactions pending review
                    </p>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={transactions} margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis 
                                    type="number"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(val) => `${currencyFilter === 'USD' ? '$' : currencyFilter === 'EUR' ? '€' : '₴'}${(val / 1000).toFixed(2)}k`}
                                />
                                <YAxis 
                                    type="category"
                                    dataKey="transaction_id"
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                                    tickFormatter={(val) => `TX-${val.substring(4, 8)}`}
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    formatter={(value) => [`${currencyFilter === 'USD' ? '$' : currencyFilter === 'EUR' ? '€' : '₴'}${value}`, "Amount"]}
                                    labelFormatter={(label) => `Transaction ID: ${label}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20}>
                                    {transactions.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 3 ? '#ef4444' : '#f87171'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100">
                    <h3 className="text-lg font-bold text-mauve-900 mb-6">
                        Status Breakdown
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FlaggedTransactionsDashboard;