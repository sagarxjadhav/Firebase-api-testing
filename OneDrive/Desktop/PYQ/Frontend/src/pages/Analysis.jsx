import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Stack, Card, CardContent, Chip, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

export default function Analysis() {
  const navigate = useNavigate()
  
  // Get quiz results from localStorage
  const quizResults = useMemo(() => {
    try { 
      return JSON.parse(localStorage.getItem('quiz_results')) || []
    } catch { 
      return []
    }
  }, [])
  
  // Calculate analysis data
  const analysisData = useMemo(() => {
    if (!quizResults.length) return null
    
    const correct = quizResults.filter(result => result.isCorrect).length
    const wrong = quizResults.filter(result => !result.isCorrect).length
    const total = quizResults.length
    const percentage = Math.round((correct / total) * 100)
    
    return { correct, wrong, total, percentage }
  }, [quizResults])
  
  if (!analysisData) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '64px', // Account for fixed AppBar height
        justifyContent: 'center',
        px: 3
      }}>
        <Typography variant="h5" gutterBottom color="text.secondary">
          No Quiz Results Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
          Complete a quiz to see your analysis here.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/exam')}
          sx={{ 
            borderRadius: 999, 
            px: 4, 
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Start Quiz
        </Button>
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
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        px: 3,
        py: 2,
        flexShrink: 0
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button 
            onClick={() => navigate(-1)} 
            sx={{ color: 'white', p: 0.5, minWidth: 'auto' }}
          >
            <ArrowBackIcon />
          </Button>
          <Typography variant="h6" fontWeight={600}>
            Quiz Analysis
          </Typography>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        px: 3, 
        py: 3,
        overflow: 'auto'
      }}>
        {/* Summary Cards */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {analysisData.correct}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Correct Answers
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CancelIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {analysisData.wrong}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Wrong Answers
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700}>
                {analysisData.percentage}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Accuracy
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Detailed Results */}
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Question-wise Analysis
        </Typography>
        
        <Stack spacing={2}>
          {quizResults.map((result, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Question {index + 1}
                  </Typography>
                  <Chip
                    icon={result.isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                    label={result.isCorrect ? 'Correct' : 'Wrong'}
                    color={result.isCorrect ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {result.question}
                </Typography>
                
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Your Answer:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: result.isCorrect ? 'success.main' : 'error.main',
                        fontWeight: 600
                      }}
                    >
                      {result.selectedAnswer !== null ? 
                        `${String.fromCharCode(65 + result.selectedAnswer)}. ${result.options[result.selectedAnswer]}` : 
                        'Not answered'
                      }
                    </Typography>
                  </Box>
                  
                  {!result.isCorrect && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Correct Answer:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'success.main',
                          fontWeight: 600
                        }}
                      >
                        {String.fromCharCode(65 + result.correctAnswer)}. {result.options[result.correctAnswer]}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
        
        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/exam')}
            sx={{ 
              borderRadius: 999, 
              px: 4, 
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Take Another Quiz
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              localStorage.removeItem('quiz_results')
              navigate('/exam')
            }}
            sx={{ 
              borderRadius: 999, 
              px: 4, 
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Clear Results
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
