import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiUsers, FiDollarSign, FiActivity, FiAlertTriangle } from "react-icons/fi";
import { useState, useEffect } from "react";
import apiClient from "../api/client";

const formatCurrency = (value, currencyCode) => {
  const locale = currencyCode === "EUR" ? "de-DE" : currencyCode === "UAH" ? "uk-UA" : "en-US"
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

const formatCompactNumber = (number, currencyCode) => {
  if (number < 1000) {return number};
  const symbol = currencyCode === "EUR" ? "€" : currencyCode === "UAH" ? "₴" : "$"
  return `${symbol}${(number / 1000).toFixed(1)}k`;
}

const Dashboard = () => {
    const [currency, setCurrency] = useState("USD")

    const [stats, setStats] = useState({
        total_balance: 0,
        active_clients: 0,
        transactions_7_days: 0,
        flagged_transactions: 0,
        chart_data: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get(`dashboard-stats/?currency=${currency}`);
                setStats(response.data);
            } catch (error) {
                console.log("Error loading stats:", error)
            } finally {
                setLoading(false)
            }
        };
        fetchStats()
    }, [currency]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-28"></div>
                    ))}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96"></div>
            </div>
        );
    }

    return (
      loading ? (
        <div className="text-mauve-500 p-6">Loading Dashboard...</div>
      ) :
    (<div className="space-y-6">
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className="text-2xl font-bold text-mauve-900">Dashboard view</h2>
          <p className="text-mauve-500 text-sm">Key indicators of VaultCore for this week.</p>
        </div>
        <div>
          <span className="text-xs font-bold text-mauve-500 uppercase px-1">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-mauve-50 text-mauve-800 font-bold text-sm rounded-lg p-1.5 outline-none cursor-pointer hover:bg-mauve-100 transition"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="UAH">UAH (₴)</option>
          </select>
          
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4 hover:-translate-y-1 transition">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FiDollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Total balance</p>
            <h3 className="text-2xl font-bold text-mauve-900 tabular-nums">{formatCompactNumber(stats.total_balance, currency)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4 hover:-translate-y-1 transition">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Active clients</p>
            <h3 className="text-2xl font-bold text-mauve-900 tabular-nums">{stats.active_clients}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4 hover:-translate-y-1 transition">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <FiActivity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Transactions in 7 days</p>
            <h3 className="text-2xl font-bold text-mauve-900 tabular-nums">{stats.transactions_7_days}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4 hover:-translate-y-1 transition">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <FiAlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Attention needed</p>
            <h3 className="text-2xl font-bold text-red-600 tabular-nums">{stats.flagged_transactions}</h3>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100">
        <h3 className="text-lg font-bold text-mauve-900 mb-6">Balance dynamic</h3>
        
        {/* used ResponsiveContainer to get good sized graph on any resolution, cool thing */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => formatCompactNumber(val, currency)}  />
              <Tooltip 
                formatter={(value) => [formatCompactNumber(value, currency), "Balance"]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>)
    )
}

export default Dashboard;