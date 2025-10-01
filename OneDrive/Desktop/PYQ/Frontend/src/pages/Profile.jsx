import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Avatar, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Stack,
  Divider,
  Button,
  IconButton
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import SchoolIcon from '@mui/icons-material/School'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import { getUserQuizResultsByEmail, getUserStatisticsByEmail, deleteUserQuizResult, getUserEmail } from '../firebase/userResultsService'
import { LinearProgress, Alert } from '@mui/material'
import { getCurrentUser, isUserAuthenticated } from '../utils/authUtils'

export default function Profile() {
  const navigate = useNavigate()
  const [firebaseQuizResults, setFirebaseQuizResults] = useState([])
  const [userStatistics, setUserStatistics] = useState(null)
  const [loadingResults, setLoadingResults] = useState(true)
  
  // Get user data using robust authentication check
  const user = getCurrentUser()
  
  // Quiz history will now come from Firebase only

  // Load Firebase quiz results
  useEffect(() => {
    const loadFirebaseResults = async () => {
      const userEmail = getUserEmail()
      if (!userEmail) {
        setLoadingResults(false)
        return
      }

      try {
        setLoadingResults(true)
        console.log('Loading Firebase quiz results for user email:', userEmail)
        
        const [results, statistics] = await Promise.all([
          getUserQuizResultsByEmail(userEmail),
          getUserStatisticsByEmail(userEmail)
        ])
        
        console.log('Firebase quiz results loaded:', results.length)
        console.log('User statistics:', statistics)
        
        setFirebaseQuizResults(results)
        setUserStatistics(statistics)
        
        if (results.length > 0) {
          console.log('✅ Successfully loaded quiz results for user:', userEmail)
        } else {
          console.log('ℹ️ No quiz results found for user:', userEmail)
        }
    } catch (error) { 
        console.error('Error loading Firebase quiz results:', error)
      } finally {
        setLoadingResults(false)
      }
    }

    loadFirebaseResults()
  }, [user?.email])

  // Function to clear quiz history (for testing)
  const clearQuizHistory = () => {
    localStorage.removeItem('quiz_history')
    window.location.reload()
  }

  // Function to delete individual quiz attempt
  const deleteQuizAttempt = async (quizId) => {
    try {
      const userEmail = getUserEmail()
      if (!userEmail) {
        alert('User email not found. Please login again.')
        return
      }
      
      // Delete from Firebase
      await deleteUserQuizResult(userEmail, quizId)
      
      // Update local state
      setFirebaseQuizResults(prev => prev.filter(quiz => quiz.id !== quizId))
      
      // Show success message
      alert('Quiz result deleted successfully!')
    } catch (error) {
      console.error('Error deleting quiz result:', error)
      alert('Error deleting quiz result. Please try again.')
    }
  }

  // Function to format completion time
  const formatCompletionTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Function to generate and download PDF
  const downloadAnalysisPDF = async (quizData, index) => {
    // Debug logging
    console.log('📊 Quiz data for PDF generation:', quizData)
    console.log('📝 Answers array:', quizData.answers)
    
    // Convert Firebase data structure to PDF format
    const results = quizData.answers || []
    
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    
    // Set up colors
    const primaryColor = '#667eea'
    const successColor = '#4caf50'
    const errorColor = '#f44336'
    const textColor = '#333333'
    const lightGray = '#f5f5f5'
    
    let yPosition = 20
    
    // Header
    doc.setFillColor(102, 126, 234)
    doc.rect(0, 0, 210, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Quiz Analysis Report', 20, 20)
    
    yPosition = 45
    
    // User Info
    doc.setTextColor(textColor)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Student: ${quizData.userName || user?.name || 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Email: ${quizData.userEmail || user?.email || 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Subject: ${quizData.subjectName || 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Year: ${quizData.year || 'N/A'}`, 20, yPosition)
    yPosition += 8
    doc.text(`Date: ${new Date(quizData.timestamp?.toDate?.() || quizData.timestamp || Date.now()).toLocaleDateString()}`, 20, yPosition)
    yPosition += 15
    
    // Summary Section
    doc.setFillColor(lightGray)
    doc.rect(15, yPosition - 5, 180, 25, 'F')
    doc.setTextColor(textColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Quiz Summary', 20, yPosition)
    yPosition += 15
    
    // Summary Cards
    const cardWidth = 50
    const cardHeight = 20
    const startX = 20
    
    // Correct Answers Card
    doc.setFillColor(successColor)
    doc.rect(startX, yPosition, cardWidth, cardHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${quizData.score || 0}`, startX + 25, yPosition + 12)
    doc.setFontSize(10)
    doc.text('Correct', startX + 25, yPosition + 18)
    
    // Wrong Answers Card
    doc.setFillColor(errorColor)
    doc.rect(startX + 60, yPosition, cardWidth, cardHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${(quizData.totalQuestions || 0) - (quizData.score || 0)}`, startX + 85, yPosition + 12)
    doc.setFontSize(10)
    doc.text('Wrong', startX + 85, yPosition + 18)
    
    // Accuracy Card
    doc.setFillColor(primaryColor)
    doc.rect(startX + 120, yPosition, cardWidth, cardHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${quizData.percentage || 0}%`, startX + 145, yPosition + 12)
    doc.setFontSize(10)
    doc.text('Accuracy', startX + 145, yPosition + 18)
    
    yPosition += 35
    
    // Question-wise Analysis
    doc.setTextColor(textColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Question-wise Analysis', 20, yPosition)
    yPosition += 10
    
    // Questions
    console.log(`📝 Processing ${results.length} questions for PDF generation`)
    results.forEach((result, qIndex) => {
      console.log(`📝 Processing question ${qIndex + 1}:`, result)
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
      
      // Question Header
      doc.setFillColor(lightGray)
      doc.rect(15, yPosition - 5, 180, 15, 'F')
      doc.setTextColor(textColor)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Question ${qIndex + 1}`, 20, yPosition + 5)
      
      // Status Badge
      const statusColor = result.isCorrect ? successColor : errorColor
      const statusText = result.isCorrect ? 'Correct' : 'Wrong'
      doc.setFillColor(statusColor)
      doc.rect(150, yPosition - 5, 45, 15, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(statusText, 165, yPosition + 5)
      
      yPosition += 20
      
      // Question Text
      doc.setTextColor(textColor)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const questionText = result.question || 'Question not available'
      const questionLines = doc.splitTextToSize(questionText, 170)
      doc.text(questionLines, 20, yPosition)
      yPosition += questionLines.length * 5 + 8
      
      // Options (if available)
      if (result.options && result.options.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Options:', 20, yPosition)
        yPosition += 6
        
        result.options.forEach((option, optIndex) => {
          const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(textColor)
          doc.text(optionText, 25, yPosition)
          yPosition += 5
        })
        yPosition += 5
      }
      
      // Your Answer
      doc.setFont('helvetica', 'bold')
      doc.text('Your Answer:', 20, yPosition)
      doc.setFont('helvetica', 'normal')
      const yourAnswerColor = result.isCorrect ? successColor : errorColor
      doc.setTextColor(yourAnswerColor)
      const yourAnswerText = result.selectedAnswer != null && result.selectedAnswer !== undefined ? 
        `${String.fromCharCode(65 + result.selectedAnswer)}. ${result.options?.[result.selectedAnswer] || 'Option not available'}` : 
        'Not answered'
      doc.text(yourAnswerText, 80, yPosition)
      yPosition += 8
      
      // Correct Answer (always show)
      doc.setTextColor(textColor)
      doc.setFont('helvetica', 'bold')
      doc.text('Correct Answer:', 20, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(successColor)
      const correctAnswerText = result.options && result.correctAnswer != null ? 
        `${String.fromCharCode(65 + result.correctAnswer)}. ${result.options[result.correctAnswer]}` : 
        'Correct answer not available'
      doc.text(correctAnswerText, 100, yPosition)
      yPosition += 8
      
      yPosition += 10
    })
    
    // Save the PDF
    const fileName = `quiz-analysis-${quizData.subjectName || 'quiz'}-${quizData.year || 'unknown'}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  if (!isUserAuthenticated()) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, paddingTop: '64px' }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h6" sx={{ color: 'var(--text-secondary)' }}>Please login to view profile</Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
        </Stack>
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

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        px: { xs: 2, sm: 3 }, 
        py: 1,
        overflow: 'auto',
        pb: { xs: 4, sm: 3 }
      }}>
        {/* Profile Header */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem'
              }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              {user.name || 'Student'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Profile Information
            </Typography>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'var(--text-primary)' }}>
              Personal Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ color: 'var(--text-primary)' }}>
                    {user.name || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon color="primary" />
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ color: 'var(--text-primary)' }}>
                    {user.email || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon color="primary" />
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Contact Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ color: 'var(--text-primary)' }}>
                    {user.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon color="primary" />
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Selected Exam
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ color: 'var(--text-primary)' }}>
                    {user.selectedExam || 'Not selected'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Firebase Quiz Results */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'var(--text-primary)' }}>
                Your Quiz Results ({firebaseQuizResults.length})
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {loadingResults && <LinearProgress sx={{ width: 100 }} />}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.location.reload()}
                  sx={{ textTransform: 'none' }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {loadingResults ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                  Loading quiz results...
                </Typography>
              </Box>
            ) : firebaseQuizResults.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ mb: 2, color: 'var(--text-secondary)' }}>
                  No quiz results found
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Complete some quizzes to see your results here
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'var(--text-primary)', fontWeight: 600 }}><strong>Subject & Year</strong></TableCell>
                      <TableCell align="center" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}><strong>Correct</strong></TableCell>
                      <TableCell align="center" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}><strong>Wrong</strong></TableCell>
                      <TableCell align="center" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}><strong>Accuracy</strong></TableCell>
                      <TableCell align="center" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}><strong>Total Questions</strong></TableCell>
                      <TableCell align="center" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}><strong>Completion Time</strong></TableCell>
                      <TableCell align="center" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {firebaseQuizResults.map((result, index) => (
                      <TableRow key={result.id || index} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} sx={{ color: 'var(--text-primary)' }}>
                            {result.subjectName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                            {result.year || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={result.score || 0}
                            color="success" 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={(result.totalQuestions || 0) - (result.score || 0)}
                            color="error" 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${result.percentage || 0}%`} 
                            color={(result.percentage || 0) >= 80 ? 'success' : (result.percentage || 0) >= 60 ? 'warning' : 'error'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                            {result.totalQuestions || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {formatCompletionTime(result.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton 
                              onClick={() => downloadAnalysisPDF(result, index)}
                              size="small"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 126, 234, 0.1)'
                                }
                              }}
                              title="Download PDF"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              onClick={() => deleteQuizAttempt(result.id)}
                              size="small"
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)'
                                }
                              }}
                              title="Delete Attempt"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* User Statistics */}
        {userStatistics && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'var(--text-primary)', mb: 2 }}>
                Your Statistics
              </Typography>
              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                    {userStatistics.totalQuizzes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Total Quizzes
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'success.main' }}>
                    {userStatistics.averageScore}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Average Score
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'warning.main' }}>
                    {userStatistics.bestScore}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Best Score
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'info.main' }}>
                    {userStatistics.subjectsAttempted}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Subjects
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

      </Box>
    </Box>
  )
}
