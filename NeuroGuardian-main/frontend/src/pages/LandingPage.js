import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaBrain, FaHospital, FaUserMd, FaAmbulance,
  FaChartLine, FaShieldAlt, FaRocket, FaHeartbeat,
  FaArrowRight, FaPlay, FaStar, FaCheckCircle, FaTimes,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaGithub,
  FaYoutube
} from 'react-icons/fa';
import Tilt from 'react-parallax-tilt';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// ============================================
// STYLED COMPONENTS
// ============================================

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 201, 240, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(76, 201, 240, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 201, 240, 0); }
`;

const glow = keyframes`
  0% { filter: drop-shadow(0 0 5px #4cc9f0); }
  50% { filter: drop-shadow(0 0 20px #7209b7); }
  100% { filter: drop-shadow(0 0 5px #4cc9f0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  color: white;
  overflow-x: hidden;
`;

const BrainIcon = styled(FaBrain)`
  font-size: 3rem;
  color: #4cc9f0;
  animation: ${glow} 3s ease-in-out infinite;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(76,201,240,0.1) 0%, transparent 50%);
    animation: ${float} 20s linear infinite;
  }
`;

const GlowingButton = styled(motion.button)`
  background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: ${pulse} 2s infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const BrainCanvas = styled.canvas`
  width: 100%;
  height: 500px;
  border-radius: 20px;
  background: transparent;
`;

// Login Popup Styles
const PopupOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupContent = styled(motion.div)`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(76, 201, 240, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const PopupTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PopupText = styled.p`
  color: #b0b0b0;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const PopupButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
  color: white;
  text-decoration: none;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  margin-right: 1rem;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PopupSecondaryButton = styled(Link)`
  display: inline-block;
  background: transparent;
  color: white;
  text-decoration: none;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// YouTube Demo Popup Styles
const YouTubePopupOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(8px);
  z-index: 1001;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const YouTubePopupContent = styled(motion.div)`
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  max-width: 90vw;
  width: 1000px;
  position: relative;
  cursor: default;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(76, 201, 240, 0.5);
  
  @media (max-width: 768px) {
    width: 95vw;
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  background: #000;
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const YouTubeCloseButton = styled.button`
  position: absolute;
  top: -45px;
  right: -10px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;
  backdrop-filter: blur(5px);

  &:hover {
    background: #ff0000;
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    top: -40px;
    right: -5px;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const AboutSection = styled.section`
  padding: 6rem 2rem;
  background: rgba(0, 0, 0, 0.2);
`;

const ContactSection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, rgba(76,201,240,0.1) 0%, rgba(114,9,183,0.1) 100%);
`;

const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const AboutContent = styled(motion.div)`
  h3 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #a78bfa;
  }

  p {
    color: #d1d5db;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #e5e7eb;

    svg {
      color: #4cc9f0;
      font-size: 1.2rem;
    }
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled(motion.div)`
  h3 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #a78bfa;
  }
`;

const ContactItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  transition: all 0.3s;

  &:hover {
    transform: translateX(10px);
    background: rgba(76, 201, 240, 0.1);
    border-color: #4cc9f0;
  }

  svg {
    font-size: 2rem;
    color: #4cc9f0;
  }

  div {
    h4 {
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
      color: #fff;
    }
    p {
      color: #9ca3af;
    }
  }
`;

const ContactForm = styled(motion.form)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  padding: 2.5rem;

  h3 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #a78bfa;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  input, textarea {
    width: 100%;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #4cc9f0;
      background: rgba(76, 201, 240, 0.1);
    }

    &::placeholder {
      color: #6b7280;
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -10px #4cc9f0;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;

  a {
    color: #9ca3af;
    font-size: 1.5rem;
    transition: all 0.3s;

    &:hover {
      color: #4cc9f0;
      transform: translateY(-3px);
    }
  }
`;

// ============================================
// COMPONENTS
// ============================================

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '1rem 2rem',
        background: isScrolled ? 'rgba(15, 15, 26, 0.95)' : 'rgba(15, 15, 26, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        transition: 'background 0.3s'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainIcon />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NeuroGuardian</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button onClick={() => scrollToSection('features')} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '1rem' }}>Features</button>
          <button onClick={() => scrollToSection('stats')} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '1rem' }}>Statistics</button>
          <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '1rem' }}>About</button>
          <button onClick={() => scrollToSection('contact')} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '1rem' }}>Contact</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login">
            <button style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>
              Login
            </button>
          </Link>
          <Link to="/register">
            <GlowingButton style={{ padding: '0.5rem 1.5rem' }}>
              Sign Up
            </GlowingButton>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

// Login Popup Component
const LoginPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <PopupOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <PopupContent
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>

        <BrainIcon style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <PopupTitle>Login Required !!</PopupTitle>
        <PopupText>
          Please login or create an account to access the AI analysis feature and start detecting strokes in seconds.
        </PopupText>

        <div>
          <PopupButton to="/login" onClick={onClose}>
            Login
          </PopupButton>
          <PopupSecondaryButton to="/register" onClick={onClose}>
            Sign Up
          </PopupSecondaryButton>
        </div>
      </PopupContent>
    </PopupOverlay>
  );
};

// YouTube Demo Popup Component - FIXED VERSION (useRef at top)
const YouTubeDemoPopup = ({ isOpen, onClose }) => {
  // useRef must be called at the top level, before any conditional returns
  const iframeRef = useRef(null);

  if (!isOpen) return null;

  return (
    <YouTubePopupOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <YouTubePopupContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <YouTubeCloseButton onClick={onClose}>
          <FaTimes />
        </YouTubeCloseButton>
        <VideoWrapper>
          <iframe
            ref={iframeRef}
            src="https://www.youtube.com/embed/dmEl-Uw816M?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1"
            title="NeuroGuardian AI Stroke Detection Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </VideoWrapper>
      </YouTubePopupContent>
    </YouTubePopupOverlay>
  );
};

// 3D Brain Component
const ThreeDBrain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 600 / 500, 0.1, 1000);
    camera.position.set(0, 10, 15);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });

    renderer.setSize(600, 500);
    renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    const loader = new GLTFLoader();

    loader.load('/whitebrain.glb', (gltf) => {
      const brain = gltf.scene;
      brain.scale.set(70, 70, 70);
      brain.position.set(0, 0, 3);
      scene.add(brain);
    }, undefined, (error) => {
      console.error('Error loading brain model:', error);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return <BrainCanvas ref={canvasRef} />;
};

const Hero = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleTryAIAnalysis = () => {
    setIsPopupOpen(true);
  };

  const handleWatchDemo = () => {
    setIsDemoOpen(true);
  };

  return (
    <HeroSection style={{ padding: '0 2rem', position: 'relative' }}>
      <LoginPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      <YouTubeDemoPopup
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(76,201,240,0.2)', borderRadius: '2rem', color: '#4cc9f0', marginBottom: '1.5rem' }}
          >
            AI-Powered Stroke Detection
          </motion.div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Detect Strokes in{' '}
            <span style={{ background: 'linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Seconds</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '2rem', maxWidth: '500px' }}>
            Save lives with 98.3% accuracy using advanced deep learning. Real-time analysis for emergency stroke detection.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
            <GlowingButton onClick={handleTryAIAnalysis}>
              Try AI Analysis <FaArrowRight style={{ marginLeft: '0.5rem' }} />
            </GlowingButton>
            <button
              onClick={handleWatchDemo}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '2rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(76,201,240,0.1)';
                e.currentTarget.style.borderColor = '#4cc9f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              <FaPlay /> Watch Demo
            </button>
          </div>

          <div style={{ display: 'flex', gap: '3rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>98.3%</div>
              <div style={{ color: '#6b7280' }}>Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>30s</div>
              <div style={{ color: '#6b7280' }}>Analysis Time</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0</div>
              <div style={{ color: '#6b7280' }}>Hospitals</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ y, opacity, position: 'relative' }}
        >
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <div style={{ position: 'relative' }}>
              <ThreeDBrain />
            </div>
          </Tilt>
        </motion.div>
      </div>
    </HeroSection>
  );
};

// Features Component
const Features = () => {
  const features = [
    { icon: <FaBrain size={30} />, title: 'Deep Learning AI', desc: 'State-of-the-art U-Net architecture with 98.3% accuracy' },
    { icon: <FaHospital size={30} />, title: 'Hospital Integration', desc: 'Seamless integration with existing hospital systems via API' },
    { icon: <FaAmbulance size={30} />, title: 'Emergency Alerts', desc: 'Instant notifications to emergency services for critical cases' },
    { icon: <FaChartLine size={30} />, title: 'Real-time Analytics', desc: 'Live dashboard with patient tracking and statistics' },
    { icon: <FaShieldAlt size={30} />, title: 'Secure medical data handling', desc: 'Enterprise-grade security and privacy protection' },
    { icon: <FaRocket size={30} />, title: 'Lightning Fast', desc: 'Results in under 30 seconds - critical for stroke treatment' }
  ];

  return (
    <section id="features" style={{ padding: '6rem 2rem' }}>
      <SectionTitle
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Why Choose NeuroGuardian
      </SectionTitle>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '1.5rem',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ color: '#4cc9f0', marginBottom: '1rem' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Stats Component
const Stats = () => (
  <section id="stats" style={{ padding: '6rem 2rem', background: 'rgba(0,0,0,0.2)' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
      {[
        { value: '98.3%', label: 'Accuracy', color: '#4cc9f0' },
        { value: '30s', label: 'Analysis Time', color: '#7209b7' },
        { value: '500+', label: 'Hospitals', color: '#4361ee' },
        { value: '10K+', label: 'Lives Saved', color: '#f72585' }
      ].map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, type: 'spring' }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            borderTop: `4px solid ${stat.color}`
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
            style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', background: `linear-gradient(135deg, ${stat.color} 0%, #7209b7 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {stat.value}
          </motion.div>
          <div style={{ color: '#9ca3af' }}>{stat.label}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

// About Component
const About = () => (
  <AboutSection id="about">
    <AboutGrid>
      <AboutContent
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3>Revolutionizing Stroke Detection with AI</h3>
        <p>
          NeuroGuardian is at the forefront of medical AI technology, combining deep learning
          with years of neurological research to create the most accurate stroke detection
          system available today.
        </p>
        <ul>
          <li>
            <FaCheckCircle /> 98.3% detection accuracy
          </li>
          <li>
            <FaCheckCircle /> Real-time analysis under 30 seconds
          </li>
        </ul>
      </AboutContent>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(76,201,240,0.1)',
          borderRadius: '2rem',
          padding: '2rem',
          border: '1px solid rgba(76,201,240,0.2)'
        }}
      >
        <h3 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#4cc9f0' }}>Our Mission</h3>
        <p style={{ color: '#d1d5db', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2rem' }}>
          "To make stroke detection accessible, accurate, and instantaneous for every
          hospital, clinic, and emergency room worldwide, saving lives through
          the power of artificial intelligence."
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4cc9f0' }}>2026</div>
            <div style={{ color: '#9ca3af' }}>Founded</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4cc9f0' }}>5+</div>
            <div style={{ color: '#9ca3af' }}>Team Members</div>
          </div>
        </div>
      </motion.div>
    </AboutGrid>
  </AboutSection>
);

// Contact Component
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <ContactSection id="contact">
      <ContactGrid>
        <ContactInfo
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h3>Get in Touch</h3>

          <ContactItem
            whileHover={{ x: 10 }}
          >
            <FaEnvelope />
            <div>
              <h4>Email</h4>
              <p>roshanmaahi786@gmail.com</p>
            </div>
          </ContactItem>

          <ContactItem
            whileHover={{ x: 10 }}
          >
            <FaPhone />
            <div>
              <h4>Phone</h4>
              <p>+91 8463969976</p>
            </div>
          </ContactItem>

          <ContactItem
            whileHover={{ x: 10 }}
          >
            <FaMapMarkerAlt />
            <div>
              <h4>Hyderabad</h4>
              <p>Secunderabad, Telangana</p>
            </div>
          </ContactItem>

          <SocialLinks>
            <a href="#"><FaLinkedin /></a>
            <a href="https://github.com/roshan2006-dev"><FaGithub /></a>
          </SocialLinks>
        </ContactInfo>

        <ContactForm
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
        >
          <h3>Send a Message</h3>

          <FormGroup>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormGroup>

          <FormGroup>
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </FormGroup>

          <FormGroup>
            <textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </FormGroup>

          <SubmitButton
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Send Message
          </SubmitButton>
        </ContactForm>
      </ContactGrid>
    </ContactSection>
  );
};

// CTA Section
const CTASection = () => (
  <section style={{ padding: '6rem 2rem' }}>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '3rem',
        padding: '4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(76,201,240,0.2) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />

      <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
        Ready to Save Lives?
      </h2>

      <Link to="/register" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
        <GlowingButton style={{ padding: '1rem 3rem' }}>
          Get Started Now <FaArrowRight style={{ marginLeft: '0.5rem' }} />
        </GlowingButton>
      </Link>

    </motion.div>
  </section>
);

// Footer
const Footer = () => (
  <footer style={{
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '3rem 2rem',
    background: 'rgba(0,0,0,0.3)'
  }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BrainIcon />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>NeuroGuardian</span>
        </div>
        <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
          AI-powered stroke detection saving lives through technology.
        </p>
      </div>

      <div>
        <h4 style={{ marginBottom: '1rem' }}>Product</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}><a href="#features" style={{ color: '#9ca3af', textDecoration: 'none' }}>Features</a></li>
          <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</a></li>
          <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>API</a></li>
        </ul>
      </div>

      <div>
        <h4 style={{ marginBottom: '1rem' }}>Company</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}><a href="#about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</a></li>
          <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</a></li>
          <li style={{ marginBottom: '0.5rem' }}><a href="#contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 style={{ marginBottom: '1rem' }}>Legal</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a></li>
          <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</a></li>
          <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>HIPAA</a></li>
        </ul>
      </div>
    </div>
    <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}>
      © 2026 NeuroGuardian AI. All rights reserved.
    </div>
  </footer>
);

// ============================================
// MAIN COMPONENT
// ============================================

const LandingPage = () => {
  useEffect(() => {
    document.title = 'NeuroGuardian AI - Stroke Detection';
  }, []);

  return (
    <Container>
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <About />
      <Contact />
      <CTASection />
      <Footer />
    </Container>
  );
};

export default LandingPage;