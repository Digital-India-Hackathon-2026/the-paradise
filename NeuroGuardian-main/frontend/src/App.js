import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RenderPage from './components/RenderPage';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/dashboard/Dashboard';
import './styles/globals.css';

function App() {
  const [showRender, setShowRender] = useState(true);

  // Check if user has already seen the render
  useEffect(() => {
    const hasSeenRender = sessionStorage.getItem('hasSeenRender');
    if (hasSeenRender) {
      setShowRender(false);
    }
  }, []);

  const handleRenderComplete = () => {
    setShowRender(false);
    sessionStorage.setItem('hasSeenRender', 'true');
  };

  // If render is complete, show the router
  if (!showRender) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    );
  }

  // Show render page first
  return <RenderPage onComplete={handleRenderComplete} />;
}

export default App;