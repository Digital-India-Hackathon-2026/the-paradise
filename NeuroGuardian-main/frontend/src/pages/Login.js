import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBrain, FaLock, FaArrowLeft, FaExclamationCircle, 
  FaUser, FaRocket, FaShieldAlt, FaHeartbeat, FaCheckCircle,
  FaEye, FaEyeSlash, FaArrowRight
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { login } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear form on mount
  useEffect(() => {
    setFormData({ username: '', password: '' });
    sessionStorage.removeItem('loginFormData');
    localStorage.removeItem('loginFormData');
  }, []);

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, when: "beforeChildren", staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity }
  };

  const rotateAnimation = {
    rotate: [0, 360],
    transition: { duration: 20, repeat: Infinity, ease: "linear" }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('📤 Attempting login with:', formData);
      
      const response = await login(formData.username, formData.password);
      console.log('📥 Login response:', response);
      
      if (response.success) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        toast.success('Login successful!', {
          icon: '🎉',
          style: { background: '#10b981', color: '#fff' }
        });
        
        // Clear form after successful login
        setFormData({ username: '', password: '' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(response.error || 'Login failed');
        toast.error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Invalid username or password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Toaster position="top-right" />

      {/* Animated Background Elements */}
      <motion.div 
        animate={rotateAnimation}
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />
      
      <motion.div 
        animate={floatingAnimation}
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      <motion.div
        animate={pulseAnimation}
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />

      <Link to="/" style={{
        position: 'absolute',
        top: '1.5rem',
        left: '1.5rem',
        color: '#d1d5db',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        fontSize: '0.875rem',
        zIndex: 10,
        padding: '0.5rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '2rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <FaArrowLeft style={{ fontSize: '0.75rem' }} />
        <span>Back to Home</span>
      </Link>

      <motion.div 
        variants={cardVariants}
        style={{
          width: '100%',
          maxWidth: '28rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '2rem',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Floating Brain Icons */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: '5%',
              right: '5%',
              opacity: 0.1,
              fontSize: '4rem'
            }}
          >
            <FaBrain />
          </motion.div>

          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            style={{
              position: 'absolute',
              bottom: '5%',
              left: '5%',
              opacity: 0.1,
              fontSize: '3rem'
            }}
          >
            <FaHeartbeat />
          </motion.div>

          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                width: '5rem',
                height: '5rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                borderRadius: '1rem',
                transform: 'rotate(45deg)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 10px 30px -10px #8b5cf6'
              }}
            >
              <FaBrain style={{ color: '#fff', fontSize: '2.5rem', transform: 'rotate(-45deg)' }} />
            </motion.div>
            
            <motion.h2 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ 
                fontSize: '2rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}
            >
              Welcome Back
            </motion.h2>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Sign in to continue to NeuroGuardian</p>
          </motion.div>

          {/* Error Message with Animation */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  marginBottom: '1.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <FaExclamationCircle style={{ fontSize: '1rem' }} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Hidden inputs to prevent browser autofill */}
            <input type="text" style={{ display: 'none' }} readOnly />
            <input type="password" style={{ display: 'none' }} readOnly />

            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '0.5rem'
              }}>
                Username
              </label>
              
              <div style={{ position: 'relative' }}>
                <FaUser style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8b5cf6',
                  fontSize: '1rem',
                  zIndex: 1
                }} />
                
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  autoComplete="off"
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    fontSize: '0.95rem',
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8b5cf6',
                  fontSize: '1rem',
                  zIndex: 1
                }} />
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 3rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    fontSize: '0.95rem',
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#d1d5db',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox" 
                  style={{
                    width: '1rem',
                    height: '1rem',
                    accentColor: '#8b5cf6',
                    cursor: 'pointer'
                  }}
                />
                Remember me
              </label>
              
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                style={{
                  color: '#8b5cf6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.target.style.color = '#8b5cf6'}
              >
                Forgot password?
              </motion.a>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 10px 20px -10px #8b5cf6',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.3s'
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: '1.2rem', height: '1.2rem', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              fontSize: '0.95rem',
              color: '#9ca3af'
            }}
          >
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{
                color: '#8b5cf6',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.target.style.color = '#8b5cf6'}
            >
              Sign up
            </Link>
          </motion.p>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
            <FaShieldAlt color="#8b5cf6" />
            <span style={{ fontSize: '0.875rem' }}>HIPAA Compliant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
            <FaCheckCircle color="#8b5cf6" />
            <span style={{ fontSize: '0.875rem' }}>Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
            <FaRocket color="#8b5cf6" />
            <span style={{ fontSize: '0.875rem' }}>24/7 Support</span>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #ffffff;
          transition: background-color 5000s ease-in-out 0s;
          box-shadow: inset 0 0 20px 20px rgba(255,255,255,0.05);
        }
      `}</style>
    </motion.div>
  );
};

export default Login;