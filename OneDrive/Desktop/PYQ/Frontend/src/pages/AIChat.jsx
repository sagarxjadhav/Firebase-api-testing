import React, { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Avatar, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Tooltip
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import PsychologyIcon from '@mui/icons-material/Psychology'
import QuizIcon from '@mui/icons-material/Quiz'
import BarChartIcon from '@mui/icons-material/BarChart'
import { callGeminiAPI } from '../config/gemini'

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [quizData, setQuizData] = useState(null)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const isInFlightRef = useRef(false)
  const lastSendAtRef = useRef(0)
  const didInitRef = useRef(false)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize AI chat with quiz data
  useEffect(() => {
    const initializeAI = async () => {
      // Guard against React StrictMode double-invocation in development
      if (didInitRef.current) return
      didInitRef.current = true
      try {
        // Avoid preflight API call to prevent burning quota

        // Get quiz history from localStorage
        const quizHistory = (() => {
          try { 
            const stored = localStorage.getItem('quiz_history')
            return stored ? JSON.parse(stored) : []
          } catch (error) { 
            console.error('Error parsing quiz history:', error)
            return [] 
          }
        })()

        // Get user data
        const user = (() => {
          try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null }
        })()

        if (!user) {
          setError('Please login to use AI chat')
          setIsInitializing(false)
          return
        }

        setQuizData({
          user: user,
          quizHistory: quizHistory
        })

        // Initialize with a lightweight local greeting (no API call)
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: `Welcome${user?.name ? ', ' + user.name : ''}! Ask me anything about your quiz performance.`,
          timestamp: new Date().toISOString()
        }])

        // Debug logs removed to reduce noise

        // Mark greeted to avoid repeat on hot-reload; API will be called only on user prompt
        sessionStorage.setItem('ai_welcome_done', '1')

        setIsInitializing(false)
      } catch (error) {
        console.error('Error initializing AI:', error)
        setError('Failed to initialize AI chat')
        setIsInitializing(false)
      }
    }

    initializeAI()
  }, [])

  const sendMessage = async () => {
    // Guard: block when empty, already loading, or throttled
    if (!inputMessage.trim() || isLoading || isInFlightRef.current) return
    const now = Date.now()
    if (now - lastSendAtRef.current < 1500) return
    lastSendAtRef.current = now
    isInFlightRef.current = true

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Prepare context for AI with the specific user question
      const context = prepareContextForAI(quizData, inputMessage)
      
      // Call Gemini API with the specific question
      const aiResponse = await callGeminiAPIHandler(context, inputMessage)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      // Only log API-related errors
      console.error('AI call failed:', error?.message || error)
      
      let errorContent = 'Sorry, I encountered an error while processing your request. Please try again later.'
      
      if (error.message.includes('API key not configured')) {
        errorContent = 'AI features are not configured yet. Please contact the administrator to set up the Gemini API key.'
      } else if (error.message.includes('API key')) {
        errorContent = 'There seems to be an issue with the AI service configuration. Please try again later.'
      } else if (error.message.toLowerCase().includes('overloaded') || error.message.includes('503')) {
        errorContent = 'The AI service is currently overloaded. I will retry automatically—please wait or try again shortly.'
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: errorContent,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      isInFlightRef.current = false
    }
  }

  const prepareContextForAI = (data, userQuestion) => {
    if (!data || !data.quizHistory) return ''

    const context = {
      user: data.user,
      totalQuizzes: data.quizHistory.length,
      // Keep only compact fields to reduce tokens (no per-question results)
      recentPerformance: data.quizHistory
        .slice(0, 3)
        .map((quiz) => ({
          date: quiz.date,
          year: quiz.year,
          totalQuestions: quiz.totalQuestions,
          correct: quiz.correct,
          wrong: quiz.wrong,
          accuracy: quiz.accuracy,
          topics: quiz.topics || [],
          mistakes: quiz.mistakes || []
        })),
      overallStats: calculateOverallStats(data.quizHistory),
      detailedQuizData: data.quizHistory.map(quiz => ({
        date: quiz.date,
        year: quiz.year,
        subject: quiz.subject,
        totalQuestions: quiz.totalQuestions,
        correct: quiz.correct,
        wrong: quiz.wrong,
        accuracy: quiz.accuracy,
        timeTaken: quiz.timeTaken,
        topics: quiz.topics || [],
        mistakes: quiz.mistakes || []
      })),
      question: userQuestion
    }

    return JSON.stringify(context, null, 2)
  }

  const calculateOverallStats = (quizHistory) => {
    if (!quizHistory.length) return null

    const totalQuestions = quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0)
    const totalCorrect = quizHistory.reduce((sum, quiz) => sum + quiz.correct, 0)
    const totalWrong = quizHistory.reduce((sum, quiz) => sum + quiz.wrong, 0)
    const averageAccuracy = Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.accuracy, 0) / quizHistory.length)

    return {
      totalQuestions,
      totalCorrect,
      totalWrong,
      averageAccuracy,
      totalQuizzes: quizHistory.length
    }
  }

  const callGeminiAPIHandler = async (context, question) => {
    try {
      console.log('Gemini API: sending request')
      // Use the actual Gemini API
      const response = await callGeminiAPI(question, context)
      return response
    } catch (error) {
      console.error('Gemini API Error:', error?.message || error)
      
      // Return a more helpful error message instead of mock responses
      return `I apologize, but I'm currently unable to connect to the AI service. The error is: ${error.message}. Please try again in a moment, or contact support if the issue persists.`
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isInitializing) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1 }}>
          Initializing AI Assistant
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Analyzing your quiz performance data...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        px: 2 
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      paddingTop: '64px' // Account for fixed AppBar height
    }}>
      {/* Header */}
   

      {/* Quiz Data Summary */}
      {quizData && quizData.quizHistory.length > 0 && (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 1, borderBottom: '1px solid var(--border-color)' }}>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            <Card variant="outlined" sx={{ minWidth: 160, backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1.25 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#667eea' }}>
                  <PsychologyIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="caption" noWrap sx={{ color: 'var(--text-secondary)' }}>Quizzes</Typography>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
                    {quizData.quizHistory.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ minWidth: 160, backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1.25 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#2ecc71' }}>
                  <BarChartIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="caption" noWrap sx={{ color: 'var(--text-secondary)' }}>Avg Accuracy</Typography>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
                    {Math.round(quizData.quizHistory.reduce((sum, quiz) => sum + quiz.accuracy, 0) / quizData.quizHistory.length)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ minWidth: 160, backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1.25 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#1abcfe' }}>
                  <QuizIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="caption" noWrap sx={{ color: 'var(--text-secondary)' }}>Total Questions</Typography>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
                    {quizData.quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0)}
                  </Typography>
                </Box>
            </CardContent>
          </Card>
          </Stack>
        </Box>
      )}

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{
                maxWidth: '80%',
                flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.type === 'user' ? '#667eea' : '#f39c12',
                  width: 32,
                  height: 32
                }}
              >
                {message.type === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  backgroundColor: message.type === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'var(--bg-secondary)',
                  color: message.type === 'user' 
                    ? 'white' 
                    : 'var(--text-primary)',
                  borderRadius: 2,
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  border: message.type === 'user' ? 'none' : '1px solid var(--border-color)',
                  boxShadow: message.type === 'user' 
                    ? '0 6px 14px rgba(102, 126, 234, 0.25)'
                    : '0 4px 10px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>
                  {message.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.75, 
                    opacity: 0.7,
                    fontSize: '0.68rem'
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Stack>
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: '#f39c12', width: 32, height: 32 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Paper sx={{ p: 2, backgroundColor: 'var(--bg-secondary)', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} />
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    AI is thinking...
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ 
        p: 1.25, 
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Ask me anything about your quiz performance..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            multiline
            maxRows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--bg-primary)',
                '& fieldset': {
                  borderColor: 'var(--border-color)',
                },
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
              '& .MuiInputBase-input': {
                color: 'var(--text-primary)',
                fontSize: '0.92rem'
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'var(--text-secondary)',
                opacity: 1,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              minWidth: 44,
              height: 44,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              },
              '&:disabled': {
                background: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }
            }}
          >
            {isLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SendIcon />}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
