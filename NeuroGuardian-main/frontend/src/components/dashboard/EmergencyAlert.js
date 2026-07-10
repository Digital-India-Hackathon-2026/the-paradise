import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaAmbulance, FaHospital } from 'react-icons/fa';

const EmergencyAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setEmergencyData({
          patient: 'John Doe',
          age: 65,
          type: 'ISCHEMIC',
          severity: 'Critical',
          location: 'ER Bay 3',
          time: new Date().toLocaleTimeString()
        });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 10000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {showAlert && emergencyData && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed bottom-6 right-6 w-96 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-2xl border border-red-400 overflow-hidden z-50"
        >
          <div className="bg-red-500/30 p-4 border-b border-red-400/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FaExclamationTriangle className="text-2xl text-yellow-300" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-yellow-400 rounded-full opacity-30"
                />
              </div>
              <div>
                <h3 className="font-bold text-white">🚨 EMERGENCY ALERT</h3>
                <p className="text-xs text-red-200">Critical Stroke Case</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Patient:</span>
              <span className="font-semibold text-white">{emergencyData.patient} ({emergencyData.age})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Type:</span>
              <span className="px-2 py-1 bg-red-500/30 rounded text-white text-sm">{emergencyData.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Severity:</span>
              <span className="px-2 py-1 bg-red-600 rounded text-white text-sm animate-pulse">{emergencyData.severity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Location:</span>
              <span className="text-white">{emergencyData.location}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Time:</span>
              <span className="text-white">{emergencyData.time}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3">
              <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                <FaAmbulance />
                <span>Dispatch</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                <FaHospital />
                <span>Prepare OR</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyAlert;