import React, { useState } from 'react';
import axios from 'axios';
import './ScanUploader.css';

const ScanUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
    
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('scan', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload-scan/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'severe': return '#f44336';
      case 'critical': return '#9C27B0';
      default: return '#666';
    }
  };

  return (
    <div className="scan-uploader">
      <h2>🧠 Upload Brain Scan</h2>
      <p className="subtitle">Supports: NIfTI (.nii), DICOM (.dcm), MRI/CT Images</p>
      
      <div className="upload-area">
        <input
          type="file"
          accept=".nii,.nii.gz,.dcm,.dicom,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {file ? file.name : 'Choose a file or drag it here'}
        </label>
        
        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!file || loading}
        className="upload-btn"
      >
        {loading ? '🔄 Analyzing...' : '🔬 Analyze Scan'}
      </button>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="result-card">
          <h3>📊 Analysis Results</h3>
          
          <div className="result-grid">
            <div className="result-item">
              <span className="label">Stroke Type:</span>
              <span className={`value ${result.stroke_type?.toLowerCase()}`}>
                {result.stroke_type}
              </span>
            </div>
            
            <div className="result-item">
              <span className="label">Severity:</span>
              <span 
                className="value severity"
                style={{ color: getSeverityColor(result.severity) }}
              >
                {result.severity}
              </span>
            </div>
            
            <div className="result-item">
              <span className="label">Volume:</span>
              <span className="value">{result.volume_ml} mL</span>
            </div>
            
            <div className="result-item">
              <span className="label">Confidence:</span>
              <span className="value">{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            
            <div className="result-item">
              <span className="label">Mean HU:</span>
              <span className="value">{result.mean_hu}</span>
            </div>
          </div>

          {result.emergency && (
            <div className="emergency-section" style={{ borderColor: result.emergency.color }}>
              <h4 style={{ color: result.emergency.color }}>
                🚨 {result.emergency.priority} PRIORITY
              </h4>
              <p className="emergency-action">{result.emergency.action}</p>
              <ul className="emergency-instructions">
                {result.emergency.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="recommendation">
            <strong>💊 Recommendation:</strong> {result.recommendation}
          </div>

          {result.overlay_url && (
            <div className="overlay-section">
              <h4>📸 Lesion Overlay</h4>
              <img 
                src={`http://127.0.0.1:8000${result.overlay_url}`} 
                alt="Segmentation Overlay"
                className="overlay-image"
              />
            </div>
          )}

          <div className="report-section">
            <h4>📋 Medical Report</h4>
            <pre className="report-text">{result.report}</pre>
          </div>

          {result.prediction_id && (
            <p className="saved">✅ Saved to database (ID: {result.prediction_id})</p>
          )}
        </div>
      )}

      <style>{`
        .scan-uploader {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #666;
          margin-bottom: 2rem;
        }
        .upload-area {
          border: 2px dashed #ccc;
          border-radius: 10px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        input[type="file"] {
          display: none;
        }
        .file-label {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #f0f0f0;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .file-label:hover {
          background: #e0e0e0;
        }
        .preview {
          margin-top: 1rem;
        }
        .preview img {
          max-width: 100%;
          max-height: 200px;
          border-radius: 5px;
        }
        .upload-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          margin: 1rem 0;
        }
        .upload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-message {
          padding: 1rem;
          background: #ffebee;
          color: #c62828;
          border-radius: 5px;
          margin: 1rem 0;
        }
        .result-card {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .result-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin: 1rem 0;
        }
        .result-item {
          padding: 0.5rem;
          background: white;
          border-radius: 5px;
        }
        .label {
          color: #666;
          font-size: 0.9rem;
          display: block;
        }
        .value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
        }
        .value.ischemic { color: #f44336; }
        .value.hemorrhagic { color: #ff9800; }
        .emergency-section {
          margin: 1.5rem 0;
          padding: 1rem;
          border-left: 5px solid;
          background: white;
          border-radius: 5px;
        }
        .emergency-action {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .emergency-instructions {
          list-style: none;
          padding: 0;
        }
        .emergency-instructions li {
          padding: 0.25rem 0;
          color: #555;
        }
        .recommendation {
          padding: 1rem;
          background: #e3f2fd;
          border-radius: 5px;
          margin: 1rem 0;
        }
        .overlay-section {
          margin: 1rem 0;
        }
        .overlay-image {
          max-width: 100%;
          border-radius: 5px;
          margin-top: 0.5rem;
        }
        .report-section {
          margin: 1rem 0;
        }
        .report-text {
          background: white;
          padding: 1rem;
          border-radius: 5px;
          font-family: monospace;
          white-space: pre-wrap;
          max-height: 300px;
          overflow-y: auto;
        }
        .saved {
          margin-top: 1rem;
          color: #4CAF50;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ScanUploader;