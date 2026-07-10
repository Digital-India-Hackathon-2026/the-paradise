import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const OverviewTab = ({ stats, recentCases }) => {
  // Sample data - replace with real data
  const riskTrends = [
    { month: 'Jan', risk: 65 },
    { month: 'Feb', risk: 59 },
    { month: 'Mar', risk: 80 },
    { month: 'Apr', risk: 81 },
    { month: 'May', risk: 76 },
    { month: 'Jun', risk: 85 },
  ];

  const severityData = [
    { name: 'Low', value: 35, color: '#4CAF50' },
    { name: 'Moderate', value: 40, color: '#FF9800' },
    { name: 'High', value: 20, color: '#f44336' },
    { name: 'Critical', value: 5, color: '#9C27B0' },
  ];

  const recentCasesList = [
    { id: 1, patient: 'John Doe', age: 65, type: 'ISCHEMIC', severity: 'High', time: '5 min ago' },
    { id: 2, patient: 'Jane Smith', age: 72, type: 'HEMORRHAGIC', severity: 'Critical', time: '12 min ago' },
    { id: 3, patient: 'Bob Johnson', age: 58, type: 'NORMAL', severity: 'None', time: '25 min ago' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard 
          title="Total Scans"
          value="1,234"
          change="+12%"
          trend="up"
          icon="📊"
        />
        <KPICard 
          title="Strokes Detected"
          value="89"
          change="+5%"
          trend="up"
          icon="⚠️"
        />
        <KPICard 
          title="Avg Response"
          value="14 min"
          change="-2 min"
          trend="down"
          icon="⏱️"
        />
        <KPICard 
          title="Accuracy"
          value="94.2%"
          change="+2.1%"
          trend="up"
          icon="🎯"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Risk Trends">
          <LineChart width={400} height={200} data={riskTrends}>
            <Line type="monotone" dataKey="risk" stroke="#8884d8" strokeWidth={2} />
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
          </LineChart>
        </ChartCard>

        <ChartCard title="Severity Distribution">
          <PieChart width={400} height={200}>
            <Pie
              data={severityData}
              cx={200}
              cy={100}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartCard>
      </div>

      {/* Recent Cases */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Cases</h3>
        <div className="space-y-3">
          {recentCasesList.map((case_) => (
            <motion.div
              key={case_.id}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 bg-white/10 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  case_.severity === 'Critical' ? 'bg-red-500 animate-pulse' :
                  case_.severity === 'High' ? 'bg-orange-500' :
                  case_.severity === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="font-medium text-white">{case_.patient}</p>
                  <p className="text-sm text-gray-400">Age {case_.age} • {case_.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">{case_.time}</p>
                <p className={`text-xs font-medium ${
                  case_.severity === 'Critical' ? 'text-red-400' :
                  case_.severity === 'High' ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {case_.severity}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const KPICard = ({ title, value, change, trend, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
    <div className={`mt-4 flex items-center text-sm ${
      trend === 'up' ? 'text-green-400' : 
      trend === 'down' ? 'text-red-400' : 'text-gray-400'
    }`}>
      {trend === 'up' && <FaArrowUp className="mr-1" />}
      {trend === 'down' && <FaArrowDown className="mr-1" />}
      {trend === 'same' && <FaMinus className="mr-1" />}
      <span>{change} from last month</span>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    <div className="flex justify-center">
      {children}
    </div>
  </div>
);

export default OverviewTab;