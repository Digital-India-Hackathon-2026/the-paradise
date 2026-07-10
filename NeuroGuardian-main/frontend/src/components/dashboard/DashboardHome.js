import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  FaArrowUp, FaArrowDown, FaMinus, FaHeartbeat,
  FaExclamationTriangle, FaClock, FaCheckCircle,
  FaBell, FaUserCircle, FaCog
} from 'react-icons/fa';

const DashboardHome = ({ stats }) => {
  const weeklyData = [
    { day: 'Mon', scans: 13, strokes: 12 },
    { day: 'Tue', scans: 10, strokes: 10 },
    { day: 'Wed', scans: 9, strokes: 9 },
    { day: 'Thu', scans: 12, strokes: 11 },
    { day: 'Fri', scans: 2, strokes: 2 },
    { day: 'Sat', scans: 3, strokes: 2 },
    { day: 'Sun', scans: 12, strokes: 11 }
  ];

  const severityData = [
    { name: 'Low', value: 35, color: '#4CAF50' },
    { name: 'Moderate', value: 40, color: '#FF9800' },
    { name: 'High', value: 20, color: '#f44336' },
    { name: 'Critical', value: 5, color: '#9C27B0' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Header with Icons */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Scans"
          value={stats.totalScans}
          change="+12.3%"
          trend="up"
          icon={<FaHeartbeat />}
          color="blue"
        />
        <KPICard 
          title="Strokes Detected"
          value={stats.strokesDetected}
          change="+5.7%"
          trend="up"
          icon={<FaExclamationTriangle />}
          color="orange"
        />
        <KPICard 
          title="Critical Cases"
          value={stats.criticalCases}
          change="-2.1%"
          trend="down"
          icon={<FaClock />}
          color="red"
        />
        <KPICard 
          title="Accuracy"
          value={`${stats.accuracy}%`}
          change="+1.2%"
          trend="up"
          icon={<FaCheckCircle />}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Activity">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #333' }} />
              <Area type="monotone" dataKey="scans" stroke="#667eea" fillOpacity={1} fill="url(#colorScans)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Severity Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #333' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400">Processing Time</p>
          <p className="text-lg font-semibold text-white">2.3s</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400">Success Rate</p>
          <p className="text-lg font-semibold text-white">99.2%</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400">Model Version</p>
          <p className="text-lg font-semibold text-white">v2.4</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400">Live Status</p>
          <p className="text-lg font-semibold text-green-400">Active</p>
        </div>
      </div>
    </motion.div>
  );
};

const KPICard = ({ title, value, change, trend, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400`}>
        {icon}
      </div>
    </div>
    <div className={`mt-4 flex items-center text-sm ${
      trend === 'up' ? 'text-green-400' : 
      trend === 'down' ? 'text-red-400' : 'text-gray-400'
    }`}>
      {trend === 'up' && <FaArrowUp className="mr-1" />}
      {trend === 'down' && <FaArrowDown className="mr-1" />}
      <span>{change}</span>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

export default DashboardHome;