import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaBrain, FaFileMedical } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import ResultsCard from '../components/ResultsCard';

const PublicScan = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('scan', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload-scan/', formData);
      
      if (response.data.success) {
        setResult(response.data.data);
        toast.success('Analysis complete!');
      } else {
        toast.error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={resetAnalysis}
            className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <FaArrowLeft /> New Scan
          </button>
          <ResultsCard result={result} onReset={resetAnalysis} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Toaster position="top-right" />
      
      {/* Simple Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white">
              <FaBrain className="text-2xl text-purple-400" />
              <span className="text-xl font-bold">NeuroGuardian</span>
            </Link>
            <Link to="/login" className="text-white hover:text-purple-400 transition">
              Doctor Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Upload Brain Scan</h1>
          <p className="text-gray-300 mb-8">Free AI-powered stroke detection - No login required</p>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center mb-6">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.dcm,.nii"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              ) : (
                <div className="space-y-4">
                  <FaUpload className="text-5xl text-purple-400 mx-auto" />
                  <p className="text-xl text-white font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports: MRI, CT, NIfTI, DICOM (PNG, JPG)
                  </p>
                </div>
              )}
            </label>
          </div>

          {file && !preview && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaFileMedical className="text-2xl text-purple-400" />
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition ${
              !file || loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </div>
            ) : (
              'Analyze Scan'
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-6">
            ⚕️ For informational purposes only. Always consult a healthcare professional.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default PublicScan;