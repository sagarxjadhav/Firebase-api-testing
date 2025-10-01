import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getQuestions } from '../data/questions'
import { getSubjectByCode } from '../firebase/dataService'
import { saveUserQuizResult, getUserEmail } from '../firebase/userResultsService'
import { getCurrentUser, getUserId } from '../utils/authUtils'
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import { Box, Typography, Button, Alert, LinearProgress, IconButton, Stack, Card, CardContent } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'

export default function Quiz() {
  const { examId, year } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [subject, setSubject] = useState(null)
  const [quizStartTime, setQuizStartTime] = useState(null)
  const [savingResult, setSavingResult] = useState(false)
  const [completedQuizData, setCompletedQuizData] = useState(null)

  // Load questions and subject info from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load subject info
        const subjectData = await getSubjectByCode(examId)
        if (!subjectData) {
          console.log(`Subject ${examId} not found, redirecting to subjects page`)
          navigate('/subjects')
          return
        }
        setSubject(subjectData)
        
        // Load questions
        const questionsData = await getQuestions(examId, year)
        console.log('Loaded questions from Firebase:', questionsData)
        setQuestions(questionsData)
      } catch (error) {
        console.error('Error loading data:', error)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
    setIndex(0)
    setAnswers({})
    setShowResult(false)
    setQuizStartTime(new Date())
  }, [examId, year, navigate])

  // Function to validate and clean quiz data
  const validateQuizData = (data) => {
    const cleaned = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        console.warn(`Removing undefined field: ${key}`)
        continue
      }
      if (value === null) {
        cleaned[key] = null
      } else if (Array.isArray(value)) {
        cleaned[key] = value.filter(item => item !== undefined)
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = validateQuizData(value)
      } else {
        cleaned[key] = value
      }
    }
    return cleaned
  }

  // Function to save quiz data from state to Firebase
  const saveQuizDataToFirebase = async () => {
    try {
      setSavingResult(true)
      
      if (!completedQuizData) {
        console.error('No quiz data in state to save')
        return
      }

      const userEmail = completedQuizData.userEmail
      if (!userEmail) {
        console.error('No user email found in quiz data')
        return
      }

      console.log('🔥 Saving quiz data from state to Firebase for user:', userEmail)
      console.log('📊 Quiz data from state:', completedQuizData)
      
      // Clean the data to remove undefined values
      const cleanQuizData = validateQuizData({
        id: completedQuizData.id || Date.now().toString(),
        userEmail: completedQuizData.userEmail || userEmail,
        subjectCode: completedQuizData.subjectCode || 'unknown',
        subjectName: completedQuizData.subjectName || 'Unknown Subject',
        year: completedQuizData.year || 'unknown',
        score: completedQuizData.score || 0,
        totalQuestions: completedQuizData.totalQuestions || 0,
        percentage: completedQuizData.percentage || 0,
        timeSpent: completedQuizData.timeSpent || 0,
        answers: (completedQuizData.answers || []).map(answer => ({
          questionIndex: answer.questionIndex || 0,
          question: answer.question || 'Question not available',
          options: answer.options || [],
          userAnswer: answer.userAnswer !== undefined ? answer.userAnswer : null,
          selectedAnswer: answer.selectedAnswer !== undefined ? answer.selectedAnswer : null,
          correctAnswer: answer.correctAnswer !== undefined ? answer.correctAnswer : null,
          isCorrect: answer.isCorrect || false
        })),
        correctAnswers: (completedQuizData.correctAnswers || []).filter(ca => ca !== undefined),
        difficulty: completedQuizData.difficulty || 'Medium',
        timestamp: completedQuizData.timestamp || new Date().toISOString(),
        createdAt: completedQuizData.createdAt || new Date().toISOString()
      })
      
      console.log('🧹 Cleaned quiz data:', cleanQuizData)
      
      const userDocRef = doc(db, 'userResults', userEmail)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        console.log('📄 User document exists, updating...')
        await updateDoc(userDocRef, {
          results: arrayUnion(cleanQuizData),
          lastUpdated: serverTimestamp(),
          totalQuizzes: (userDoc.data().totalQuizzes || 0) + 1
        })
        console.log('✅ Document updated successfully')
      } else {
        console.log('📄 User document does not exist, creating new one...')
        await setDoc(userDocRef, {
          userEmail: userEmail,
          results: [cleanQuizData],
          totalQuizzes: 1,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        })
        console.log('✅ New document created successfully')
      }
      
      console.log('🎉 Collection "userResults" created/updated in Firebase!')
      alert('Quiz result saved successfully!')
      
    } catch (error) {
      console.error('❌ Error saving quiz data to Firebase:', error)
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
      alert(`Error saving quiz result: ${error.message}`)
    } finally {
      setSavingResult(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2,
        paddingTop: '64px' // Account for fixed AppBar height
      }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h6">Loading questions...</Typography>
          <LinearProgress sx={{ width: 200 }} />
        </Stack>
      </Box>
    )
  }

  if (!questions.length) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2,
        paddingTop: '64px' // Account for fixed AppBar height
      }}>
        <Stack spacing={3} alignItems="center">
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No questions found. Please add questions for this exam and year in the Data Manager.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/data-manager')}
            sx={{ 
              borderRadius: 999, 
              px: 4, 
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Go to Data Manager
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            sx={{ 
              borderRadius: 999, 
              px: 4, 
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Go back
          </Button>
        </Stack>
      </Box>
    )
  }

  const current = questions[index]
  const selected = answers[current.id]

  function selectOption(i) {
    console.log('Selecting option:', i, 'for question:', current.id)
    setAnswers(prev => {
      // If clicking on the already selected option, deselect it
      if (prev[current.id] === i) {
        const newAnswers = { ...prev }
        delete newAnswers[current.id]
        console.log('Deselected option for question:', current.id)
        return newAnswers
      }
      // Otherwise, select the new option
      const newAnswers = { ...prev, [current.id]: i }
      console.log('Updated answers:', newAnswers)
      return newAnswers
    })
  }

  async function next() {
    if (index < questions.length - 1) setIndex(index + 1)
    else {
      // Calculate quiz results and save to state
      console.log('📊 Calculating score...')
      console.log('Questions:', questions)
      console.log('First question structure:', questions[0])
      console.log('Answers:', answers)
      console.log('Question IDs:', questions.map(q => q.id))
      console.log('Answer keys:', Object.keys(answers))
      
      const score = questions.reduce((correct, question) => {
        const userAnswer = answers[question.id]
        const correctAnswer = question.correctAnswer || question.ans || question.correct
        const isCorrect = userAnswer === correctAnswer
        console.log(`Question ${question.id}: user=${userAnswer}, correct=${correctAnswer}, isCorrect=${isCorrect}`)
        return correct + (isCorrect ? 1 : 0)
      }, 0)
      
      console.log('📊 Final score:', score)

      const percentage = Math.round((score / questions.length) * 100)
      const timeSpent = Math.round((new Date() - quizStartTime) / 1000)

      // Get user email from localStorage
      const userEmail = localStorage.getItem('user_email')
      if (!userEmail) {
        console.error('No user email found in localStorage')
        alert('Please login again to save quiz results')
        return
      }

      // Prepare quiz data for state
      const quizData = {
        id: Date.now().toString(),
        userEmail: userEmail,
        subjectCode: examId,
        subjectName: subject?.name || 'Unknown Subject',
        year: year,
        score: score,
        totalQuestions: questions.length,
        percentage: percentage,
        timeSpent: timeSpent,
        answers: questions.map((question, questionIndex) => {
          const userAnswer = answers[question.id]
          const correctAnswer = question.correctAnswer || question.ans || question.correct
          const isCorrect = userAnswer === correctAnswer
          
          console.log(`Processing question ${question.id}: user=${userAnswer}, correct=${correctAnswer}, isCorrect=${isCorrect}`)
          
          return {
            questionIndex: questionIndex,
            question: question.question || question.q,
            options: question.options || [],
            userAnswer: userAnswer,
            selectedAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
          }
        }),
        correctAnswers: questions.map(q => q.correctAnswer || q.ans || q.correct),
        difficulty: 'Medium',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      // Save to state
      setCompletedQuizData(quizData)
      console.log('📊 Quiz data saved to state:', quizData)
      
      setShowResult(true)
    }
  }

  function prev() {
    if (index > 0) setIndex(index - 1)
  }

  function restart() {
    setIndex(0)
    setAnswers({})
    setShowResult(false)
  }

  // Calculate score based on current answers
  const score = questions.reduce((acc, q) => {
    const userAnswer = answers[q.id]
    const correctAnswer = q.correctAnswer || q.ans || q.correct
    const isCorrect = userAnswer === correctAnswer
    console.log(`Question ${q.id}: selected=${userAnswer}, correct=${correctAnswer}, isCorrect=${isCorrect}`)
    return acc + (isCorrect ? 1 : 0)
  }, 0)
  
  console.log('Total score:', score, 'out of', questions.length)

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      paddingTop: '64px' // Account for fixed AppBar height
    }}>
      {!showResult ? (
        <>
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.2, sm: 1.5 },
            flexShrink: 0
          }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {subject ? subject.name : 'Quiz'} - {year}
                      </Typography>
                    </Stack>
            
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem', minWidth: '35px' }}>
                📝 {index + 1}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(index + 1) / questions.length * 100}
                sx={{ 
                  flex: 1, 
                  height: 4, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
                }}
              />
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem', minWidth: '35px', textAlign: 'right' }}>
                ⏱️ {questions.length}
              </Typography>
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ 
            flex: 1, 
            px: { xs: 1.5, sm: 2 }, 
            py: { xs: 1.5, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0
          }}>
            {/* Question */}
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 2, sm: 2.5 }, 
                textAlign: 'center',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.3
              }}
            >
              {current.q}
            </Typography>

            {/* Options */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              minHeight: 0
            }}>
              <Stack spacing={1}>
                {current.options.map((opt, i) => (
                  <Button
                    key={i}
                    variant={selected === i ? 'contained' : 'outlined'}
                    onClick={() => selectOption(i)}
                    sx={{
                      py: { xs: 1.2, sm: 1.3 },
                      px: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      fontWeight: selected === i ? 600 : 400,
                      border: selected === i ? 'none' : '1px solid var(--border-color)',
                      backgroundColor: selected === i ? '#667eea' : 'transparent',
                      color: selected === i ? 'white' : 'var(--text-primary)',
                      minHeight: { xs: 42, sm: 44 },
                      '&:hover': {
                        backgroundColor: selected === i ? '#5a6fd8' : 'rgba(102, 126, 234, 0.1)',
                        border: selected === i ? 'none' : '1px solid #667eea'
                      }
                    }}
                  >
                    <Box component="span" sx={{ 
                      fontWeight: 700, 
                      mr: { xs: 1.2, sm: 1.5 },
                      minWidth: '20px',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' }
                    }}>
                      {String.fromCharCode(65 + i)}
                    </Box>
                    {opt}
                  </Button>
                ))}
              </Stack>
              
              {/* Navigation Buttons - Right after options */}
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={prev}
                    disabled={index === 0}
                    sx={{
                      flex: 1,
                      py: { xs: 1.2, sm: 1.3 },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 600,
                      minHeight: { xs: 44, sm: 46 },
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid #667eea'
                      },
                      '&:disabled': {
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    onClick={next}
                    sx={{
                      flex: 1,
                      py: { xs: 1.2, sm: 1.3 },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 600,
                      minHeight: { xs: 44, sm: 46 },
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      }
                    }}
                  >
                    {index < questions.length - 1 ? 'Next' : 'Finish'}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        // Analysis Results Screen
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
            py: { xs: 2, sm: 3 },
            overflow: 'auto',
            pb: { xs: 4, sm: 3 }
          }}>
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
              <Button 
                onClick={() => navigate(-1)} 
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    color: 'primary.main'
                  }
                }}
              >
                Back
              </Button>
            </Box>
            
            {/* Summary Cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                    {score}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Correct Answers
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                    {questions.length - score}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Wrong Answers
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                    {Math.round((score / questions.length) * 100)}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Accuracy
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            {/* Performance Message */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  {score === questions.length ? '🎉 Perfect Score!' : 
                   score >= questions.length * 0.8 ? '👏 Excellent Work!' :
                   score >= questions.length * 0.6 ? '👍 Good Job!' : 
                   '📚 Keep Practicing!'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {score === questions.length ? 'Outstanding performance! You got everything right!' :
                   score >= questions.length * 0.8 ? 'Great job! You\'re doing really well!' :
                   score >= questions.length * 0.6 ? 'Good effort! Keep up the practice!' : 
                   'Don\'t give up! Practice makes perfect!'}
                </Typography>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2, color: 'var(--text-primary)' }}>
              Question-wise Analysis
            </Typography>
            
            <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
              {questions.map((q, idx) => {
                const sel = answers[q.id]
                const correct = q.correctAnswer
                const isCorrect = sel === correct
                return (
                  <Card key={`question-${idx}-${q.id}`} variant="outlined" sx={{ 
                    border: isCorrect ? '2px solid #4caf50' : '2px solid #f44336',
                    backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'
                  }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, color: 'var(--text-primary)' }}>
                          Question {idx + 1}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {isCorrect ? (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              color: 'success.main',
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }}>
                              <Box sx={{ 
                                width: { xs: 16, sm: 20 }, 
                                height: { xs: 16, sm: 20 }, 
                                borderRadius: '50%', 
                                backgroundColor: 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: { xs: '0.7rem', sm: '0.8rem' }
                              }}>
                                ✓
                              </Box>
                              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                Correct
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              color: 'error.main',
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }}>
                              <Box sx={{ 
                                width: { xs: 16, sm: 20 }, 
                                height: { xs: 16, sm: 20 }, 
                                borderRadius: '50%', 
                                backgroundColor: 'error.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: { xs: '0.7rem', sm: '0.8rem' }
                              }}>
                                ✗
                              </Box>
                              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                Wrong
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Stack>
                      
                      <Typography variant="body2" sx={{ 
                        mb: { xs: 1.5, sm: 2 }, 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.4,
                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                      }}>
                        {q.question}
                      </Typography>
                      
                      <Stack spacing={{ xs: 0.8, sm: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight={600} sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            minWidth: { xs: '80px', sm: '90px' },
                            color: 'var(--text-secondary)'
                          }}>
                            Your Answer:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: isCorrect ? 'success.main' : 'error.main',
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              flex: 1
                            }}
                          >
                            {sel != null ? 
                              `${String.fromCharCode(65 + sel)}. ${q.options[sel]}` : 
                              'Not answered'
                            }
                          </Typography>
                        </Box>
                        
                        {!isCorrect && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight={600} sx={{ 
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              minWidth: { xs: '80px', sm: '90px' },
                              color: 'var(--text-secondary)'
                            }}>
                              Correct Answer:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'success.main',
                                fontWeight: 600,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                flex: 1
                              }}
                            >
                              {String.fromCharCode(65 + correct)}. {q.options[correct]}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )
              })}
            </Stack>
            
            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1.5, sm: 2 }, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              mt: { xs: 2, sm: 3 },
              pb: { xs: 4, sm: 3 },
              mb: { xs: 2, sm: 1 }
            }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)}
                sx={{ 
                  borderRadius: 999, 
                  px: { xs: 3, sm: 4 }, 
                  py: { xs: 1.2, sm: 1.5 },
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: { xs: 120, sm: 140 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                  '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                Back to Years
              </Button>
              <Button 
                variant="contained" 
                onClick={saveQuizDataToFirebase}
                disabled={savingResult}
                sx={{ 
                  borderRadius: 999, 
                  px: { xs: 3, sm: 4 }, 
                  py: { xs: 1.2, sm: 1.5 },
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: { xs: 120, sm: 140 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                  },
                  '&:disabled': {
                    background: '#cccccc',
                    color: '#666666'
                  }
                }}
              >
                {savingResult ? 'Saving...' : 'Save to Firebase'}
              </Button>
              <Button 
                variant="contained" 
                onClick={restart}
                sx={{ 
                  borderRadius: 999, 
                  px: { xs: 3, sm: 4 }, 
                  py: { xs: 1.2, sm: 1.5 },
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: { xs: 120, sm: 140 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                Try Again
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}


