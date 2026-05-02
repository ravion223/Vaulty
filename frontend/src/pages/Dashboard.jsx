import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiUsers, FiDollarSign, FiActivity, FiAlertTriangle } from "react-icons/fi";

const chartData = [
    { name: 'Mon', balance: 4000 },
    { name: 'Tue', balance: 3000 },
    { name: 'Wed', balance: 5000 },
    { name: 'Thu', balance: 2780 },
    { name: 'Fri', balance: 8890 },
    { name: 'Sat', balance: 2390 },
    { name: 'Sun', balance: 3490 },
];

const Dashboard = () => {
    return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-mauve-900">Dashboard view</h2>
        <p className="text-mauve-500 text-sm">Key indicators of VaultCore for this week.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FiDollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Total balance</p>
            <h3 className="text-2xl font-bold text-mauve-900 tabular-nums">$1,245,890</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Active clients</p>
            <h3 className="text-2xl font-bold text-mauve-900 tabular-nums">1,024</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <FiActivity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Transactions in 24h</p>
            <h3 className="text-2xl font-bold text-mauve-900 tabular-nums">842</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <FiAlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-mauve-500">Attention needed</p>
            <h3 className="text-2xl font-bold text-red-600 tabular-nums">12</h3>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-mauve-100">
        <h3 className="text-lg font-bold text-mauve-900 mb-6">Balance dynamic</h3>
        
        {/* used ResponsiveContainer to get good sized graph on any resolution, cool thing */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    )
}

export default Dashboard;