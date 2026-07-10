import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, FaVenusMars, FaHeart, FaLungs, 
  FaRuler, FaWeight, FaSmoking, FaIdCard,
  FaRing, FaBriefcase, FaHome, FaTint
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import ResultsCard from '../ResultsCard';

const FormPrediction = () => {
  const [formData, setFormData] = useState({
    idn: '',
    gender: '',
    age: '',
    hypertension: '',
    heart_disease: '',
    ever_married: '',
    work_type: '',
    residence_type: '',
    avg_glucose_level: '',
    bmi: '',
    smoking_status: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const patientData = {
        idn: formData.idn || `FORM-${Date.now()}`,
        gender: formData.gender,
        age: parseInt(formData.age),
        hypertension: parseInt(formData.hypertension),
        heart_disease: parseInt(formData.heart_disease),
        ever_married: formData.ever_married,
        work_type: formData.work_type,
        residence_type: formData.residence_type,
        avg_glucose_level: parseFloat(formData.avg_glucose_level),
        bmi: parseFloat(formData.bmi),
        smoking_status: formData.smoking_status
      };

      const response = await api.post('predict/', patientData);
      
      if (response.data.success) {
        setResult(response.data.data);
        toast.success('Prediction complete!');
      } else {
        toast.error(response.data.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error(error.response?.data?.error || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setResult(null)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
        >
          ← New Prediction
        </button>
        <ResultsCard result={result} onReset={() => setResult(null)} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Stroke Risk Prediction Form</h2>
        <p className="text-gray-400 mb-6">Enter patient details to predict stroke risk using AI</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaIdCard className="mr-2 text-purple-400" /> Reading ID (Optional)
              </label>
              <input
                type="text"
                name="idn"
                value={formData.idn}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="Enter ID"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaVenusMars className="mr-2 text-purple-400" /> Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                <option value="">Select Gender</option>
                <option value="Male" style={{ color: '#000000' }}>Male</option>
                <option value="Female" style={{ color: '#000000' }}>Female</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaUser className="mr-2 text-purple-400" /> Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="120"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="Enter age"
              />
            </div>

            {/* Hypertension */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaHeart className="mr-2 text-purple-400" /> Hypertension *
              </label>
              <select
                name="hypertension"
                value={formData.hypertension}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                <option value="">Select</option>
                <option value="0" style={{ color: '#000000' }}>No</option>
                <option value="1" style={{ color: '#000000' }}>Yes</option>
              </select>
            </div>

            {/* Heart Disease */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaLungs className="mr-2 text-purple-400" /> Heart Disease *
              </label>
              <select
                name="heart_disease"
                value={formData.heart_disease}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                <option value="">Select</option>
                <option value="0" style={{ color: '#000000' }}>No</option>
                <option value="1" style={{ color: '#000000' }}>Yes</option>
              </select>
            </div>

            {/* Ever Married */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaRing className="mr-2 text-purple-400" /> Ever Married *
              </label>
              <select
                name="ever_married"
                value={formData.ever_married}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                <option value="">Select</option>
                <option value="Yes" style={{ color: '#000000' }}>Yes</option>
                <option value="No" style={{ color: '#000000' }}>No</option>
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaBriefcase className="mr-2 text-purple-400" /> Work Type *
              </label>
              <select
                name="work_type"
                value={formData.work_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                <option value="">Select</option>
                <option value="Private" style={{ color: '#000000' }}>Private</option>
                <option value="Self-employed" style={{ color: '#000000' }}>Self-employed</option>
                <option value="Govt_job" style={{ color: '#000000' }}>Government</option>
                <option value="children" style={{ color: '#000000' }}>Children</option>
              </select>
            </div>

            {/* Residence Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaHome className="mr-2 text-purple-400" /> Residence Type *
              </label>
              <select
                name="residence_type"
                value={formData.residence_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                <option value="">Select</option>
                <option value="Urban" style={{ color: '#000000' }}>Urban</option>
                <option value="Rural" style={{ color: '#000000' }}>Rural</option>
              </select>
            </div>

            {/* Glucose Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaTint className="mr-2 text-purple-400" /> Avg Glucose Level *
              </label>
              <input
                type="number"
                step="0.01"
                name="avg_glucose_level"
                value={formData.avg_glucose_level}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="e.g., 145.6"
              />
            </div>

            {/* BMI */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaWeight className="mr-2 text-purple-400" /> BMI *
              </label>
              <input
                type="number"
                step="0.1"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="e.g., 28.5"
              />
            </div>

            {/* Smoking Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaSmoking className="mr-2 text-purple-400" /> Smoking Status *
              </label>
              <select
                name="smoking_status"
                value={formData.smoking_status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
              >
                <option value="">Select</option>
                <option value="never smoked" style={{ color: '#000000' }}>Never Smoked</option>
                <option value="formerly smoked" style={{ color: '#000000' }}>Formerly Smoked</option>
                <option value="smokes" style={{ color: '#000000' }}>Smokes</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Predict Stroke Risk'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-purple-400">
            <span className="font-bold">Note:</span> This form uses AI to predict stroke risk based on patient data. 
            Results should be verified by medical professionals.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FormPrediction;