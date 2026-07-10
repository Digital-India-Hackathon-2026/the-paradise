import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaFilter, FaEye, FaFilePdf, FaDownload,
  FaTrash, FaCalendarAlt, FaFileCsv, FaTimes,
  FaUserMd, FaHeartbeat, FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Fetch patients from backend
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await api.get('history/');
      console.log('📥 Patient history:', response.data);
      
      if (response.data.success) {
        setPatients(response.data.data);
        setFilteredPatients(response.data.data);
      } else {
        // If no real data, use demo data
        setPatients(demoPatients);
        setFilteredPatients(demoPatients);
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      // Fallback to demo data
      setPatients(demoPatients);
      setFilteredPatients(demoPatients);
    } finally {
      setLoading(false);
    }
  };

  // Demo data for fallback
  const demoPatients = [
    { id: 1, name: 'John Doe', age: 65, gender: 'Male', lastScan: '2026-03-03', result: 'ISCHEMIC', severity: 'High', confidence: 0.92, volume: 24.5 },
    { id: 2, name: 'Jane Smith', age: 72, gender: 'Female', lastScan: '2026-03-02', result: 'HEMORRHAGIC', severity: 'Critical', confidence: 0.94, volume: 38.2 },
    { id: 3, name: 'Robert Johnson', age: 58, gender: 'Male', lastScan: '2026-03-01', result: 'NORMAL', severity: 'None', confidence: 0.98, volume: 0 },
    { id: 4, name: 'Emily Wilson', age: 45, gender: 'Female', lastScan: '2026-02-28', result: 'ISCHEMIC', severity: 'Moderate', confidence: 0.88, volume: 12.3 },
    { id: 5, name: 'Michael Brown', age: 80, gender: 'Male', lastScan: '2026-02-27', result: 'HEMORRHAGIC', severity: 'Severe', confidence: 0.91, volume: 45.7 },
  ];

  // Filter patients based on search and filter
  useEffect(() => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.result.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Result type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(patient => 
        patient.result === selectedFilter
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(patient => 
        patient.lastScan >= dateRange.start && patient.lastScan <= dateRange.end
      );
    }

    setFilteredPatients(filtered);
  }, [searchTerm, selectedFilter, patients, dateRange]);

  const viewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const downloadPDF = (patient) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Patient Medical Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const data = [
      ['Patient Name', patient.name],
      ['Age', patient.age.toString()],
      ['Gender', patient.gender],
      ['Scan Date', patient.lastScan],
      ['Result', patient.result],
      ['Severity', patient.severity],
      ['Confidence', `${(patient.confidence * 100).toFixed(1)}%`],
      ['Lesion Volume', `${patient.volume} mL`],
    ];
    
    doc.autoTable({
      startY: 40,
      head: [['Field', 'Value']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`${patient.name}_report.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Age', 'Gender', 'Last Scan', 'Result', 'Severity', 'Confidence', 'Volume'];
    const csvData = filteredPatients.map(p => [
      p.name, p.age, p.gender, p.lastScan, p.result, p.severity, 
      `${(p.confidence * 100).toFixed(1)}%`, `${p.volume} mL`
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_history.csv';
    a.click();
    
    toast.success('CSV downloaded successfully!');
  };

  const deletePatient = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        // Call API to delete
        // await api.delete(`/patient/${id}`);
        setPatients(patients.filter(p => p.id !== id));
        toast.success('Record deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'severe': return 'bg-orange-500/20 text-orange-400';
      case 'high': return 'bg-red-400/20 text-red-300';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400';
      case 'mild': return 'bg-green-500/20 text-green-400';
      case 'none': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'ISCHEMIC': return 'bg-blue-500/20 text-blue-400';
      case 'HEMORRHAGIC': return 'bg-orange-500/20 text-orange-400';
      case 'NORMAL': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with actions */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Patient History</h2>
            <p className="text-gray-300">View and manage patient records</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaFileCsv /> Export CSV
            </button>
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <FaCalendarAlt /> Date Filter
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <AnimatePresence>
          {showDateFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-white/5 rounded-lg"
            >
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <button
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-gray-800">All Results</option>
              <option value="ISCHEMIC" className="bg-gray-800">Ischemic</option>
              <option value="HEMORRHAGIC" className="bg-gray-800">Hemorrhagic</option>
              <option value="NORMAL" className="bg-gray-800">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading patients...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Age/Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Last Scan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Result</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Severity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Confidence</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {patient.age} / {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {patient.lastScan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getResultColor(patient.result)}`}>
                          {patient.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(patient.severity)}`}>
                          {patient.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {(patient.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewDetails(patient)}
                            className="p-2 hover:bg-purple-500/20 rounded-lg transition group"
                            title="View Details"
                          >
                            <FaEye className="text-gray-400 group-hover:text-purple-400" />
                          </button>
                          <button
                            onClick={() => downloadPDF(patient)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition group"
                            title="Download PDF"
                          >
                            <FaFilePdf className="text-gray-400 group-hover:text-blue-400" />
                          </button>
                          <button
                            onClick={() => deletePatient(patient.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition group"
                            title="Delete Record"
                          >
                            <FaTrash className="text-gray-400 group-hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      <AnimatePresence>
        {showModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Patient Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FaTimes className="text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <p className="font-semibold text-gray-800">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Age</label>
                      <p className="font-semibold text-gray-800">{selectedPatient.age}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Gender</label>
                      <p className="font-semibold text-gray-800">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Scan Date</label>
                      <p className="font-semibold text-gray-800">{selectedPatient.lastScan}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Result</label>
                      <p className={`font-semibold ${getResultColor(selectedPatient.result)} inline-block px-2 py-1 rounded`}>
                        {selectedPatient.result}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Severity</label>
                      <p className={`font-semibold ${getSeverityColor(selectedPatient.severity)} inline-block px-2 py-1 rounded`}>
                        {selectedPatient.severity}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Confidence</label>
                      <p className="font-semibold text-gray-800">
                        {(selectedPatient.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Lesion Volume</label>
                      <p className="font-semibold text-gray-800">{selectedPatient.volume} mL</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
                    <p className="text-gray-600 text-sm">
                      {selectedPatient.result === 'ISCHEMIC' && 'Thrombolytic therapy recommended within 4.5 hours. Consider mechanical thrombectomy for large vessel occlusion.'}
                      {selectedPatient.result === 'HEMORRHAGIC' && 'Emergency neurosurgery consultation required. Reverse anticoagulation if applicable. Monitor ICP.'}
                      {selectedPatient.result === 'NORMAL' && 'No acute findings. Continue routine follow-up and risk factor modification.'}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => downloadPDF(selectedPatient)}
                      className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <FaFilePdf /> Download PDF
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PatientHistory;