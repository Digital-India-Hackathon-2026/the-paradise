import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { 
  FaBrain, FaHospital, FaAmbulance, FaUserMd,
  FaChartLine, FaHistory, FaBell, FaDownload,
  FaShare, FaPrint, FaEnvelope, FaPhone,
  FaHeartbeat, FaClock, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaPlay
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import api from '../../services/api';

const MainDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Simulate live updates
    const interval = setInterval(fetchLiveAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('stats/');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const fetchLiveAlerts = () => {
    // Simulate live alerts
    const alerts = [
      { id: 1, message: 'New stroke case detected', severity: 'high', time: 'just now' },
      { id: 2, message: 'Ambulance dispatched', severity: 'medium', time: '2 min ago' }
    ];
    setLiveAlerts(alerts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Toaster position="top-right" />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white/10 backdrop-blur-lg border-b border-white/20"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FaBrain className="text-5xl text-purple-400" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">NeuroSentry AI</h1>
                  <p className="text-sm text-gray-300">Real-time Stroke Detection & Emergency Response</p>
                </div>
              </div>
              
              {/* Live stats */}
              <div className="flex space-x-6">
                <StatCard 
                  icon={<FaHospital />} 
                  label="Hospitals" 
                  value="24" 
                  color="blue"
                />
                <StatCard 
                  icon={<FaUserMd />} 
                  label="Online" 
                  value="156" 
                  color="green"
                />
                <StatCard 
                  icon={<FaAmbulance />} 
                  label="Emergency" 
                  value="3" 
                  color="red"
                  pulse
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-6 py-6">
          <div className="flex space-x-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm w-fit">
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon={<FaChartLine />}
              label="Overview"
            />
            <TabButton 
              active={activeTab === 'analysis'} 
              onClick={() => setActiveTab('analysis')}
              icon={<FaBrain />}
              label="Analysis"
            />
            <TabButton 
              active={activeTab === 'hospital'} 
              onClick={() => setActiveTab('hospital')}
              icon={<FaHospital />}
              label="Hospital"
            />
            <TabButton 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')}
              icon={<FaHistory />}
              label="History"
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab stats={stats} recentCases={recentCases} />}
            {activeTab === 'analysis' && <AnalysisTab />}
            {activeTab === 'hospital' && <HospitalTab liveAlerts={liveAlerts} />}
            {activeTab === 'history' && <HistoryTab />}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color, pulse }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10"
  >
    <div className="flex items-center space-x-3">
      <div className={`text-${color}-400 text-xl`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-white flex items-center">
          {value}
          {pulse && (
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="ml-2 w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </p>
      </div>
    </div>
  </motion.div>
);

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
      active 
        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
        : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </motion.button>
);

export default MainDashboard;