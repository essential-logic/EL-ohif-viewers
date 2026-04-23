import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, TextField, CircularProgress, Paper, Avatar } from '@mui/material';
import { Close as CloseIcon, Send as SendIcon, SmartToy as BotIcon, Person as UserIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'marked-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICopilotProps {
  open: boolean;
  onClose: () => void;
  studyInstanceUIDs?: string | string[];
}

export const AICopilot: React.FC<AICopilotProps> = ({ open, onClose, studyInstanceUIDs }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your AI Radiology Copilot. I can help interpret metadata, summarize findings, or answer general protocol questions. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      // Use a safer check for process.env to avoid "process is not defined"
      // Prioritize global window config, then fallback to process.env
      const apiKey = (window as any).GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');

      if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
        throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file and restart the server.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert AI Radiology Assistant integrated into the Essential Logic OHIF Viewer. 
You are currently viewing DICOM Study Instance UID: ${Array.isArray(studyInstanceUIDs) ? studyInstanceUIDs[0] : studyInstanceUIDs}.
The user is a radiologist or clinician asking a question. Please be highly professional, accurate, and concise.

User Question: ${userText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.text || "I'm sorry, I could not generate a response.",
        },
      ]);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message}.`,
        },
      ]);
    } finally {


      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            bottom: 20,
            width: 380,
            maxWidth: 'calc(100vw - 40px)',
            zIndex: 9999,
          }}
        >
          <Paper
            elevation={24}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(14, 165, 233, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.1)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.1) 0%, transparent 100%)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BotIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                    AI Copilot
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
                    powered by Gemini
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Chat History */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: isUser ? 'rgba(255,255,255,0.1)' : 'primary.main',
                        width: 28,
                        height: 28,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {isUser ? <UserIcon sx={{ fontSize: 16 }} /> : <BotIcon sx={{ fontSize: 16 }} />}
                    </Avatar>
                    <Box
                      sx={{
                        maxWidth: '85%',
                        p: 1.5,
                        borderRadius: 2,
                        borderBottomRightRadius: isUser ? 4 : 2,
                        borderBottomLeftRadius: isUser ? 2 : 4,
                        bgcolor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(14, 165, 233, 0.15)',
                        border: '1px solid',
                        borderColor: isUser ? 'rgba(255, 255, 255, 0.05)' : 'rgba(14, 165, 233, 0.3)',
                        color: isUser ? '#f8fafc' : '#f0f9ff',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        wordBreak: 'break-word',
                        '& p': { mt: 0, mb: 1, '&:last-child': { mb: 0 } },
                        '& strong': { fontWeight: 700, color: isUser ? '#ffffff' : '#38bdf8' },
                        '& ul, & ol': { pl: 2.5, mt: 0.5, mb: 1, '&:last-child': { mb: 0 } },
                        '& li': { mb: 0.5, '&:last-child': { mb: 0 } },
                      }}
                    >
                      <Markdown>{msg.content}</Markdown>
                    </Box>
                  </Box>
                );
              })}
              {isTyping && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28 }}>
                    <BotIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      borderBottomLeftRadius: 4,
                      bgcolor: 'rgba(14, 165, 233, 0.1)',
                      border: '1px solid rgba(14, 165, 233, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CircularProgress size={12} thickness={5} sx={{ color: '#0ea5e9' }} />
                    <Typography variant="caption" sx={{ color: '#0ea5e9' }}>Analyzing...</Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'rgba(0,0,0,0.2)' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: '4px 8px',
                  '&:focus-within': {
                    borderColor: 'rgba(14, 165, 233, 0.5)',
                    boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.2)'
                  }
                }}
              >
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Ask the Copilot..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  InputProps={{
                    disableUnderline: true,
                    style: { color: 'white', fontSize: '0.95rem', padding: '8px 4px' },
                  }}
                  multiline
                  maxRows={4}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  sx={{ 
                    bgcolor: input.trim() && !isTyping ? 'primary.main' : 'transparent',
                    color: input.trim() && !isTyping ? 'white' : 'text.disabled',
                    '&:hover': { bgcolor: 'primary.dark' },
                    transition: 'all 0.2s',
                    p: 1
                  }}
                >
                  <SendIcon fontSize="small" sx={{ ml: 0.5 }} />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', textAlign: 'center', mt: 1, fontSize: '0.65rem' }}>
                AI can make mistakes. Verify critical findings.
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
