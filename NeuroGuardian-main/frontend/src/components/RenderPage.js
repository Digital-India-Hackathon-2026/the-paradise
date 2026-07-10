import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

// ✅ IMPORT YOUR VIDEO
import introVideo from '../assets/intro.mp4'; // change if needed

// ============================================
// STYLED COMPONENTS
// ============================================

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 🔥 FIXED VIDEO SIZE HERE
const Video = styled.video`
  width: 90%;
  height: 90%;
  object-fit: contain;   // ✅ prevents zoom/crop
  background: black;
`;

const WelcomeScreen = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, #000, #1a0033);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ============================================
// MAIN COMPONENT
// ============================================

const RenderPage = ({ onComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef(null);

  const handleVideoEnd = () => {
    setVideoEnded(true);

    setTimeout(() => {
      onComplete && onComplete();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {!videoEnded ? (
        <Container>
          <Video
            ref={videoRef}
            src={introVideo}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          />
        </Container>
      ) : (
        <WelcomeScreen
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.8 }}
            style={{
              fontSize: '3.5rem',
              background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0,255,255,0.5)'
            }}
          >
            WELCOME TO NEUROGUARDIAN
          </motion.h1>
        </WelcomeScreen>
      )}
    </AnimatePresence>
  );
};

export default RenderPage;