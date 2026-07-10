import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBrain, FaUser, FaEnvelope, FaLock, FaPhone, 
  FaVenusMars, FaArrowLeft, FaExclamationCircle,
  FaGlobe, FaMapMarkerAlt, FaCity, FaHome,
  FaRocket, FaShieldAlt, FaHeartbeat, FaCheckCircle,
  FaEye, FaEyeSlash, FaUserPlus, FaArrowRight
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  
  // ✅ Clear form data on component mount
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneno: '',
    country: '',
    state: '',
    city: '',
    address: '',
    gender: ''
  });

  // ✅ Clear any stored form data on page load
  useEffect(() => {
    // Clear any stored form data from session/local storage
    sessionStorage.removeItem('registerFormData');
    localStorage.removeItem('registerFormData');
    
    // Reset form to empty
    setFormData({
      username: '',
      email: '',
      password: '',
      phoneno: '',
      country: '',
      state: '',
      city: '',
      address: '',
      gender: ''
    });

    // Force clear browser autofill by resetting form
    const form = document.querySelector('form');
    if (form) form.reset();
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    const pwd = formData.password;
    if (pwd.length > 5) strength += 1;
    if (pwd.length > 7) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.phoneno) {
      setError('Please fill all required fields'); 
      return false;
    }
    if (formData.password.length < 6) { 
      setError('Password must be at least 6 characters'); 
      return false; 
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) { 
      setError('Please enter a valid email'); 
      return false; 
    }
    if (!/^\d{10}$/.test(formData.phoneno)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.country || !formData.state || !formData.city || !formData.address || !formData.gender) {
      setError('Please fill all required fields'); 
      return false;
    }
    return true;
  };

  const handleNext = () => { 
    if (validateStep1()) { 
      setStep(2); 
      setError(''); 
    } 
  };

  const handleBack = () => { 
    setStep(1); 
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setLoading(true); 
    setError('');

    try {
      console.log('📤 Sending registration data:', formData);
      
      const response = await register(formData);
      console.log('📥 Registration response:', response);
      
      if (response.success) {
        toast.success('Registration successful! Please login.', {
          icon: '🎉',
          style: { background: '#10b981', color: '#fff' }
        });
        
        // Clear form after successful registration
        setFormData({
          username: '',
          email: '',
          password: '',
          phoneno: '',
          country: '',
          state: '',
          city: '',
          address: '',
          gender: ''
        });
        
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.error || 'Registration failed');
        toast.error(response.error || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed. Username may already exist.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally { 
      setLoading(false); 
    }
  };

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

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#ef4444';
    if (passwordStrength <= 3) return '#f97316';
    if (passwordStrength <= 4) return '#facc15';
    return '#10b981';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
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
        animate={{ ...floatingAnimation }}
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
        animate={{ ...pulseAnimation }}
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
        <FaArrowLeft style={{ fontSize: '0.75rem' }} /> Back to Home
      </Link>

      <motion.div 
        variants={cardVariants}
        style={{
          width: '100%',
          maxWidth: '32rem',
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
              Create Account
            </motion.h2>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Join NeuroGuardian today</p>
          </motion.div>

          {/* Progress with Animation */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '2rem',
              transformOrigin: 'center'
            }}
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '600',
                background: step >= 1 ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.1)',
                color: step >= 1 ? '#fff' : '#6b7280',
                border: '2px solid',
                borderColor: step >= 1 ? 'transparent' : 'rgba(255,255,255,0.1)',
                boxShadow: step >= 1 ? '0 0 20px #8b5cf6' : 'none',
                transition: 'all 0.3s'
              }}
            >
              1
            </motion.div>
            
            <motion.div 
              animate={{ width: step >= 2 ? '5rem' : '4rem' }}
              style={{
                height: '0.25rem',
                margin: '0 0.75rem',
                background: step >= 2 ? 'linear-gradient(90deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                transition: 'all 0.5s'
              }}
            />
            
            <motion.div 
              whileHover={{ scale: 1.1 }}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '600',
                background: step >= 2 ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.1)',
                color: step >= 2 ? '#fff' : '#6b7280',
                border: '2px solid',
                borderColor: step >= 2 ? 'transparent' : 'rgba(255,255,255,0.1)',
                boxShadow: step >= 2 ? '0 0 20px #8b5cf6' : 'none',
                transition: 'all 0.3s'
              }}
            >
              2
            </motion.div>
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
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  {[
                    { name: 'username', icon: FaUser, placeholder: 'Choose a username', type: 'text', autoComplete: 'off' },
                    { name: 'email', icon: FaEnvelope, placeholder: 'Enter your email', type: 'email', autoComplete: 'off' },
                    { name: 'password', icon: FaLock, placeholder: 'Minimum 6 characters', type: 'password', autoComplete: 'new-password' },
                    { name: 'phoneno', icon: FaPhone, placeholder: '10-digit phone number', type: 'tel', autoComplete: 'off' }
                  ].map((field, index) => {
                    const Icon = field.icon;
                    const isPassword = field.name === 'password';
                    
                    return (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#d1d5db',
                          marginBottom: '0.5rem'
                        }}>
                          {field.name.charAt(0).toUpperCase() + field.name.slice(1)} *
                        </label>
                        
                        <div style={{ position: 'relative' }}>
                          <Icon style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#8b5cf6',
                            fontSize: '1rem',
                            zIndex: 1
                          }} />
                          
                          <input
                            type={isPassword && showPassword ? 'text' : field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required
                            placeholder={field.placeholder}
                            autoComplete={field.autoComplete}
                            style={{
                              width: '100%',
                              padding: isPassword ? '1rem 1rem 1rem 3rem' : '1rem 1rem 1rem 3rem',
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
                          
                          {isPassword && (
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
                          )}
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {isPassword && formData.password && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: '0.5rem' }}
                          >
                            <div style={{
                              display: 'flex',
                              gap: '0.25rem',
                              marginBottom: '0.25rem'
                            }}>
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{
                                    backgroundColor: i < passwordStrength ? getStrengthColor() : 'rgba(255,255,255,0.1)'
                                  }}
                                  style={{
                                    flex: 1,
                                    height: '0.25rem',
                                    borderRadius: '1rem',
                                    transition: 'background-color 0.3s'
                                  }}
                                />
                              ))}
                            </div>
                            <p style={{
                              fontSize: '0.75rem',
                              color: getStrengthColor(),
                              margin: 0
                            }}>
                              Password Strength: {getStrengthText()}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNext}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      boxShadow: '0 10px 20px -10px #8b5cf6'
                    }}
                  >
                    Next Step <FaArrowRight />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  {[
                    { name: 'country', icon: FaGlobe, placeholder: 'Enter your country', autoComplete: 'off' },
                    { name: 'state', icon: FaMapMarkerAlt, placeholder: 'Enter your state', autoComplete: 'off' },
                    { name: 'city', icon: FaCity, placeholder: 'Enter your city', autoComplete: 'off' },
                    { name: 'address', icon: FaHome, placeholder: 'Enter your address', autoComplete: 'off' }
                  ].map((field, index) => {
                    const Icon = field.icon;
                    return (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#d1d5db',
                          marginBottom: '0.5rem'
                        }}>
                          {field.name.charAt(0).toUpperCase() + field.name.slice(1)} *
                        </label>
                        
                        <div style={{ position: 'relative' }}>
                          <Icon style={{
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
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required
                            placeholder={field.placeholder}
                            autoComplete={field.autoComplete}
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
                    );
                  })}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#d1d5db',
                      marginBottom: '0.5rem'
                    }}>
                      Gender *
                    </label>
                    
                    <div style={{ position: 'relative' }}>
                      <FaVenusMars style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#8b5cf6',
                        fontSize: '1rem',
                        zIndex: 1
                      }} />
                      
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '1rem 1rem 1rem 3rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '1rem',
                          fontSize: '0.95rem',
                          color: '#fff',
                          outline: 'none',
                          cursor: 'pointer',
                          appearance: 'none'
                        }}
                      >
                        <option value="" style={{ background: '#1f2937' }}>Select Gender</option>
                        <option value="Male" style={{ background: '#1f2937' }}>Male</option>
                        <option value="Female" style={{ background: '#1f2937' }}>Female</option>
                        <option value="Other" style={{ background: '#1f2937' }}>Other</option>
                      </select>
                    </div>
                  </motion.div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleBack}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: '500',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaArrowLeft /> Back
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1,
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
                        opacity: loading ? 0.5 : 1
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ width: '1.2rem', height: '1.2rem', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }}
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          Sign Up <FaUserPlus />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              fontSize: '0.95rem',
              color: '#9ca3af'
            }}
          >
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{
                color: '#8b5cf6',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.target.style.color = '#8b5cf6'}
            >
              Sign in
            </Link>
          </motion.p>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
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

export default Register;