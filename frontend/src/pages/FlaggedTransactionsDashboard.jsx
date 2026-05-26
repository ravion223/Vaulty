import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import apiClient from "../api/client";

const FlaggedTransactionsDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFraudData = async () => {
            try {
                const response = await apiClient.get("flagged-transactions");
                setTransactions(response.data.results ? response.data.results : response.data);
            } catch (error) {
                console.error("Error loading fraud stats:", error)
            } finally {
                setLoading(false)
            }
        };
        fetchFraudData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
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
                                tickFormatter={(val) => `$${(val / 1000).toFixed(2)}k`}
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
                                formatter={(value) => [`$${value}`, "Amount"]}
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
        </div>
    )
}

export default FlaggedTransactionsDashboard;