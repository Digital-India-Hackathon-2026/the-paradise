import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { FaBrain, FaTimes, FaPaperPlane, FaRobot, FaUser, FaCommentDots } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';

// ============================================
// GEMINI CLIENT SETUP
// ============================================
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `You are NeuroGuardian AI Assistant — a friendly, knowledgeable medical AI chatbot embedded on the NeuroGuardian website.

About NeuroGuardian:
- NeuroGuardian is an AI-powered stroke detection platform
- It uses deep learning (U-Net, Swin Transformer, ResNet34) to analyze brain scans
- It achieves 98.3% detection accuracy in under 30 seconds
- It can detect ischemic strokes, hemorrhagic strokes, and normal scans
- It provides risk prediction from patient health data (tabular prediction)
- It generates AI medical reports using Google Gemini
- It locates nearby stroke centers/hospitals

Your role:
1. Answer questions about stroke detection, symptoms, prevention, and NeuroGuardian's features
2. Explain how the AI analysis works in simple terms
3. Provide general brain health information
4. Guide users to sign up / login if they want to try the actual scan analysis
5. Be empathetic, professional, and reassuring — this is a medical context

Rules:
- Keep responses concise (2-4 paragraphs max unless asked for detail)
- Use emojis sparingly for warmth (🧠, 💡, ⚡, 🏥)
- NEVER provide actual medical diagnoses — always recommend consulting a doctor
- If asked anything unrelated to health/strokes/NeuroGuardian, politely redirect
- Format responses in clean markdown when helpful (bold, lists, etc.)
- Respond in the same language the user writes in`;

// ============================================
// ANIMATIONS
// ============================================
const pulseRing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 201, 240, 0.6); }
  70% { box-shadow: 0 0 0 15px rgba(76, 201, 240, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 201, 240, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ============================================
// STYLED COMPONENTS
// ============================================
const ChatButton = styled(motion.button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
  border: none;
  color: white;
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: ${pulseRing} 2s ease-out infinite;
  box-shadow: 0 8px 32px rgba(76, 201, 240, 0.35);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.1);
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #f72585;
  border-radius: 50%;
  border: 2px solid #0f0f1a;
  animation: ${float} 2s ease-in-out infinite;
`;

const ChatWindow = styled(motion.div)`
  position: fixed;
  bottom: 6.5rem;
  right: 2rem;
  width: 400px;
  height: 560px;
  background: rgba(15, 15, 26, 0.97);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(76, 201, 240, 0.25);
  border-radius: 1.5rem;
  z-index: 998;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(76, 201, 240, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  @media (max-width: 500px) {
    width: calc(100vw - 1.5rem);
    height: calc(100vh - 8rem);
    right: 0.75rem;
    bottom: 5.5rem;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(76, 201, 240, 0.12) 0%, rgba(114, 9, 183, 0.12) 100%);
  border-bottom: 1px solid rgba(76, 201, 240, 0.15);

  .header-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
  }

  .header-info {
    flex: 1;

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    span {
      font-size: 0.75rem;
      color: #4ade80;
      display: flex;
      align-items: center;
      gap: 0.35rem;

      &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4ade80;
        display: inline-block;
      }
    }
  }
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 0.85rem;

  &:hover {
    background: rgba(247, 37, 133, 0.2);
    border-color: #f72585;
    color: #f72585;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(76, 201, 240, 0.2);
    border-radius: 4px;
  }
`;

const MessageBubble = styled(motion.div)`
  max-width: 85%;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  word-wrap: break-word;

  ${({ $isUser }) =>
    $isUser
      ? `
    align-self: flex-end;
    background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
    color: white;
    border-bottom-right-radius: 4px;
  `
      : `
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.06);
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom-left-radius: 4px;
  `}

  /* Markdown styles */
  p { margin: 0 0 0.5rem 0; }
  p:last-child { margin-bottom: 0; }
  strong { color: #4cc9f0; font-weight: 600; }
  ul, ol { margin: 0.3rem 0; padding-left: 1.2rem; }
  li { margin-bottom: 0.2rem; }
  code {
    background: rgba(0,0,0,0.3);
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.82rem;
  }
  a { color: #4cc9f0; text-decoration: underline; }
`;

const MessageLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #6b7280;
  margin-bottom: 0.3rem;
  ${({ $isUser }) => $isUser ? 'justify-content: flex-end;' : ''}

  svg { font-size: 0.65rem; }
`;

const TypingIndicator = styled(motion.div)`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.2rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  border-bottom-left-radius: 4px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  background: #4cc9f0;
  border-radius: 50%;
  animation: ${dotBounce} 1.4s ease-in-out infinite both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
`;

const QuickBtn = styled(motion.button)`
  padding: 0.45rem 0.85rem;
  background: rgba(76, 201, 240, 0.08);
  border: 1px solid rgba(76, 201, 240, 0.2);
  border-radius: 2rem;
  color: #4cc9f0;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;

  &:hover {
    background: rgba(76, 201, 240, 0.18);
    border-color: #4cc9f0;
    transform: translateY(-1px);
  }
`;

const InputArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 0.7rem 1rem;
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s;

  &::placeholder { color: #6b7280; }

  &:focus {
    border-color: rgba(76, 201, 240, 0.5);
    background: rgba(76, 201, 240, 0.06);
  }
`;

const SendButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ disabled }) => disabled
    ? 'rgba(255,255,255,0.05)'
    : 'linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%)'};
  border: none;
  color: ${({ disabled }) => disabled ? '#6b7280' : 'white'};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(76, 201, 240, 0.3);
  }
`;

const WelcomeCard = styled(motion.div)`
  text-align: center;
  padding: 1.5rem 1rem;

  .welcome-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    display: inline-block;
    background: linear-gradient(135deg, #4cc9f0 0%, #7209b7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  h3 {
    font-size: 1.15rem;
    margin-bottom: 0.4rem;
    background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #9ca3af;
    font-size: 0.82rem;
    line-height: 1.5;
  }
`;

const ErrorBanner = styled(motion.div)`
  margin: 0.5rem 1rem;
  padding: 0.65rem 1rem;
  background: rgba(247, 37, 133, 0.1);
  border: 1px solid rgba(247, 37, 133, 0.3);
  border-radius: 0.75rem;
  color: #f472b6;
  font-size: 0.8rem;
  text-align: center;

  a {
    color: #4cc9f0;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const PoweredBy = styled.div`
  text-align: center;
  padding: 0.4rem;
  font-size: 0.65rem;
  color: #4b5563;
  background: rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;

  span {
    background: linear-gradient(135deg, #4cc9f0, #7209b7);
    background-size: 200% auto;
    animation: ${shimmer} 3s linear infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
  }
`;

// ============================================
// CHATBOT COMPONENT
// ============================================
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatHistoryRef = useRef([]);

  const quickQuestions = [
    'What is NeuroGuardian?',
    'Stroke symptoms?',
    'How does AI detection work?',
    'How accurate is it?',
  ];

  // Check for API key on mount
  useEffect(() => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
      setHasApiKey(false);
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowNotification(false);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Update chat history for context
    chatHistoryRef.current.push({ role: 'user', parts: [{ text: text.trim() }] });

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: chatHistoryRef.current,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      const botText = response.text || "I'm sorry, I couldn't process that. Please try again.";

      // Update history
      chatHistoryRef.current.push({ role: 'model', parts: [{ text: botText }] });

      setMessages((prev) => [...prev, { role: 'bot', content: botText }]);
    } catch (err) {
      console.error('Gemini API error:', err);

      let errorMsg = "Sorry, I couldn't connect to my AI brain right now. Please try again in a moment.";
      if (err.message?.includes('API_KEY') || err.message?.includes('401') || err.message?.includes('403')) {
        errorMsg = "⚠️ API key issue. Please make sure your Gemini API key is set correctly in the `.env` file.";
        setHasApiKey(false);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: errorMsg },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <ChatButton
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            id="chatbot-toggle"
          >
            <FaCommentDots />
            {showNotification && <NotificationBadge />}
          </ChatButton>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <ChatHeader>
              <div className="header-icon">
                <FaBrain />
              </div>
              <div className="header-info">
                <h4>NeuroGuardian AI</h4>
                <span>Online — Powered by Gemini</span>
              </div>
              <CloseBtn onClick={() => setIsOpen(false)} id="chatbot-close">
                <FaTimes />
              </CloseBtn>
            </ChatHeader>

            {/* API Key Error */}
            {!hasApiKey && (
              <ErrorBanner
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                ⚠️ Gemini API key not configured. Add your key to{' '}
                <code>frontend/.env</code> as <code>REACT_APP_GEMINI_API_KEY</code>.{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                  Get free key →
                </a>
              </ErrorBanner>
            )}

            {/* Messages */}
            <MessagesContainer>
              {messages.length === 0 && (
                <WelcomeCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="welcome-icon">🧠</div>
                  <h3>Hi! I'm NeuroGuardian AI</h3>
                  <p>
                    Ask me anything about stroke detection, brain health, or how
                    NeuroGuardian works. I'm here to help!
                  </p>
                </WelcomeCard>
              )}

              {messages.map((msg, idx) => (
                <div key={idx}>
                  <MessageLabel $isUser={msg.role === 'user'}>
                    {msg.role === 'user' ? (
                      <>
                        You <FaUser />
                      </>
                    ) : (
                      <>
                        <FaRobot /> NeuroGuardian AI
                      </>
                    )}
                  </MessageLabel>
                  <MessageBubble
                    $isUser={msg.role === 'user'}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </MessageBubble>
                </div>
              ))}

              {isTyping && (
                <TypingIndicator
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Dot $delay="0s" />
                  <Dot $delay="0.2s" />
                  <Dot $delay="0.4s" />
                </TypingIndicator>
              )}

              <div ref={messagesEndRef} />
            </MessagesContainer>

            {/* Quick Actions (only when no messages) */}
            {messages.length === 0 && (
              <QuickActions>
                {quickQuestions.map((q, i) => (
                  <QuickBtn
                    key={i}
                    onClick={() => sendMessage(q)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isTyping || !hasApiKey}
                  >
                    {q}
                  </QuickBtn>
                ))}
              </QuickActions>
            )}

            {/* Input */}
            <InputArea>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasApiKey ? 'Ask about strokes, brain health...' : 'API key required...'}
                disabled={isTyping || !hasApiKey}
                id="chatbot-input"
              />
              <SendButton
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping || !hasApiKey}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                id="chatbot-send"
              >
                <FaPaperPlane />
              </SendButton>
            </InputArea>

            {/* Footer */}
            <PoweredBy>
              Powered by <span>Google Gemini</span> ✨
            </PoweredBy>
          </ChatWindow>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
