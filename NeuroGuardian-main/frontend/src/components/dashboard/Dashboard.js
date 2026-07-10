import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  FaBrain, FaHospital, FaChartLine, FaBell, FaHeartbeat, FaClock,
  FaExclamationTriangle, FaUpload, FaFileMedical, FaUserCircle,
  FaSignOutAlt, FaCog, FaUser, FaEnvelope, FaPhone, FaVenusMars, FaTimes,
  FaMicroscope, FaStethoscope, FaAmbulance, FaCheckCircle, FaShieldAlt,
  FaCalendarAlt, FaArrowUp, FaArrowDown, FaBalanceScale
} from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/globals.css';

// Import components
import DashboardHome from './DashboardHome';
import ScanAnalysis from './ScanAnalysis';
import HospitalView from './HospitalView';
import EmergencyAlert from './EmergencyAlert';
import FormPrediction from './FormPrediction';

function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('checking');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalScans: 62,
    strokesDetected: 60,
    criticalCases: 15,
    accuracy: 96.5
  });
  const [recentCases, setRecentCases] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Define fetchDashboardStats function
  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('stats/');
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.log('Using demo stats');
      // Keep existing demo stats
    }
  };

  // ✅ Define fetchRecentCases function
  const fetchRecentCases = async () => {
    try {
      const response = await api.get('history/');
      if (response.data.success) {
        setRecentCases(response.data.data.slice(0, 3));
      } else {
        // Demo data
        setRecentCases([
          { id: 1, patient: 'Patient 245', time: '5 min ago', result: 'ISCHEMIC', severity: 'Critical', confidence: 98 },
          { id: 2, patient: 'Patient 189', time: '15 min ago', result: 'NORMAL', severity: 'None', confidence: 99 },
          { id: 3, patient: 'Patient 312', time: '42 min ago', result: 'ISCHEMIC', severity: 'High', confidence: 96 }
        ]);
      }
    } catch {
      setRecentCases([]);
    }
  };

  // ✅ Define refreshStats function
  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      // Try to fetch from API first
      const response = await api.get('stats/');
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
        toast.success('Stats updated!');
      } else {
        // If API fails, update demo stats with increment
        updateDemoStats();
      }
    } catch {
      // Update demo stats with increment
      updateDemoStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ Define updateDemoStats function
  const updateDemoStats = () => {
    // Simulate real-time updates with small increments
    setStats(prev => {
      // Random small increment (0-2) to simulate new scans
      const newScanIncrement = Math.floor(Math.random() * 2);
      const newStrokeIncrement = Math.random() > 0.7 ? 1 : 0; // 30% chance of new stroke
      const newCriticalIncrement = Math.random() > 0.8 ? 1 : 0; // 20% chance of critical
      
      const newTotalScans = prev.totalScans + newScanIncrement;
      const newStrokesDetected = prev.strokesDetected + newStrokeIncrement;
      const newCriticalCases = prev.criticalCases + newCriticalIncrement;
      
      // Recalculate accuracy
      const newAccuracy = ((newStrokesDetected / newTotalScans) * 100).toFixed(1);
      
      setLastUpdated(new Date());
      
      return {
        totalScans: newTotalScans,
        strokesDetected: newStrokesDetected,
        criticalCases: newCriticalCases,
        accuracy: parseFloat(newAccuracy)
      };
    });
  };

  // ✅ Define onNewScanUploaded function
  const onNewScanUploaded = () => {
    refreshStats();
    fetchRecentCases();
    toast.success('New scan processed! Stats updated.');
  };

  useEffect(() => {
    checkApiHealth();
    fetchDashboardStats();
    fetchRecentCases();
    fetchUserData();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Auto-refresh stats every 30 seconds
    const refreshInterval = setInterval(() => {
      refreshStats();
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshInterval);
    };
  }, []);

  // Listen for new scan uploads
  useEffect(() => {
    const handleNewScan = (event) => {
      // Update stats when new scan is uploaded
      refreshStats();
      toast.success('New scan processed! Stats updated.');
    };

    window.addEventListener('newScanUploaded', handleNewScan);
    return () => window.removeEventListener('newScanUploaded', handleNewScan);
  }, []);

  const fetchUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  };

  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/health/');
      const data = await response.json();
      setApiStatus(data.status === 'healthy' ? 'online' : 'offline');
      if (data.status === 'healthy') {
        toast.success('API Connected');
        refreshStats();
      }
    } catch {
      setApiStatus('offline');
      toast.error('API Connection Failed - Using Demo Data');
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
    toast.success('Notifications cleared');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1e1e2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          success: { icon: '✅', style: { borderLeft: '4px solid #10b981' } },
          error: { icon: '❌', style: { borderLeft: '4px solid #ef4444' } }
        }}
      />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-4000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-20"
        >
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FaBrain className="text-4xl text-purple-400" />
                  <motion.div animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">NeuroGuardian</h1>
                  <p className="text-xs text-gray-400">AI-Powered Stroke Detection</p>
                </div>
              </div>

              {/* Status & Profile */}
              <div className="flex items-center space-x-6">
                <div className="hidden md:block">
                  <p className="text-sm text-gray-400">{currentTime.toLocaleTimeString()}</p>
                  <p className="text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${apiStatus==='online'?'bg-green-400 animate-pulse':'bg-red-400'}`} />
                  <span className="text-sm text-gray-300 hidden md:inline">API {apiStatus}</span>
                  {isRefreshing && (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full ml-2"
                    />
                  )}
                </div>

                {/* Notifications */}
                <div className="relative z-40">
                  <button onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-white/10 rounded-lg transition">
                    <FaBell className="text-xl text-gray-300" />
                    {notifications.length>0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs text-white rounded-full flex items-center justify-center animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div initial={{ opacity:0, y:-10 }} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}
                        className="absolute right-0 mt-2 w-80 bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 overflow-visible z-50">
                        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                          <h3 className="font-semibold text-white">Notifications</h3>
                          {notifications.length>0 && <button onClick={clearNotifications} className="text-xs text-gray-400 hover:text-white">Clear all</button>}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length===0 ? (
                            <p className="text-center text-gray-400 py-4">No notifications</p>
                          ) : (
                            notifications.map(notif=>(
                              <div key={notif.id} className="p-3 hover:bg-gray-700/50 border-b border-gray-700 last:border-0">
                                <div className="flex items-start space-x-2">
                                  {notif.type==='critical' && <span className="text-red-400">🚨</span>}
                                  <div>
                                    <p className="text-sm text-white">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative z-40">
                  <button onClick={()=>setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition">
                    <FaUserCircle className="text-2xl text-gray-300" />
                    <span className="text-sm text-gray-300 hidden md:inline">{userData?.username||'Dr. Sharma'}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
                        className="absolute right-0 mt-2 w-48 bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 overflow-visible z-50">
                        <div className="p-2">
                          <button onClick={()=>{setShowUserMenu(false); setShowProfileModal(true)}}
                            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition">
                            <FaUserCircle />
                            <span className="text-sm">Profile</span>
                          </button>
                          <button onClick={()=>{setShowUserMenu(false); setShowSettingsModal(true)}}
                            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition">
                            <FaCog />
                            <span className="text-sm">Settings</span>
                          </button>
                          <hr className="my-2 border-gray-700" />
                          <button onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-red-600/20 rounded-lg text-red-400 hover:text-red-300 transition">
                            <FaSignOutAlt />
                            <span className="text-sm">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 -mb-px overflow-x-auto scrollbar-hide">
              <NavButton active={activeView==='dashboard'} onClick={()=>setActiveView('dashboard')} icon={<FaChartLine />} label="Dashboard"/>
              <NavButton active={activeView==='form'} onClick={()=>setActiveView('form')} icon={<FaFileMedical />} label="Form Prediction"/>
              <NavButton active={activeView==='scan'} onClick={()=>setActiveView('scan')} icon={<FaUpload />} label="New Scan"/>
              <NavButton active={activeView==='hospital'} onClick={()=>setActiveView('hospital')} icon={<FaHospital />} label="Hospital View"/>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 mt-20 relative z-10">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <DashboardHome 
                key="dashboard" 
                stats={stats} 
                onNewScan={onNewScanUploaded}
              />
            )}
            {activeView === 'form' && (
              <FormPrediction 
                key="form" 
                onPredictionComplete={refreshStats}
              />
            )}
            {activeView === 'scan' && (
              <ScanAnalysis 
                key="scan" 
                onScanComplete={onNewScanUploaded}
              />
            )}
            {activeView === 'hospital' && (
              <HospitalView 
                key="hospital" 
                stats={stats}
              />
            )}
          </AnimatePresence>
        </main>

        <EmergencyAlert />
      </div>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      borderRadius: '0.5rem 0.5rem 0 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: active ? '#6B46C1' : 'rgba(255,255,255,0.1)',
      color: active ? '#FFFFFF' : '#E5E7EB',
      border: 'none',
      outline: 'none',
      position: 'relative'
    }}
  >
    {icon}
    <span>{label}</span>
    {active && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#805AD5,#4299E1)'}} />}
  </button>
);

export default Dashboard;