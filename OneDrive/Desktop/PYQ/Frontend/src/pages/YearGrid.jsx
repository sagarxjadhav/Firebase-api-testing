import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Stack, Button, Typography, LinearProgress } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import QuizIcon from '@mui/icons-material/Quiz'
import InsightsIcon from '@mui/icons-material/Insights'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getAvailableYears } from '../data/questions'
import { getSubjectByCode } from '../firebase/dataService'

export default function YearGrid() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log(`Loading data for examId: ${examId}`)
        
        // Load subject info
        const subjectData = await getSubjectByCode(examId)
        if (!subjectData) {
          console.log(`Subject ${examId} not found, redirecting to subjects page`)
          navigate('/subjects')
          return
        }
        setSubject(subjectData)
        
        // Load years
        const yearsData = await getAvailableYears(examId)
        console.log('Loaded years from Firebase:', yearsData)
        
        if (yearsData && yearsData.length > 0) {
          setYears(yearsData)
        } else {
          console.log('No years found, using fallback years')
          // Fallback to last 10 years if no data found
          const current = new Date().getFullYear()
          setYears(Array.from({ length: 10 }, (_, i) => current - i))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to last 10 years if no data found
        const current = new Date().getFullYear()
        setYears(Array.from({ length: 10 }, (_, i) => current - i))
      } finally {
        setLoading(false)
      }
    }

    if (examId) {
      loadData()
    }
  }, [examId, navigate])

  if (loading) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '64px'
      }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h6">Loading years...</Typography>
          <LinearProgress sx={{ width: 200 }} />
        </Stack>
      </Box>
    )
  }

  return (
    <Box sx={{
      position: 'relative',
      height: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'stretch',
      paddingTop: '64px', // Account for fixed AppBar height
      justifyContent: 'center',
      px: 2,
      py: 2,
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(800px 260px at 20% 20%, rgba(76,139,245,0.10), transparent), radial-gradient(600px 220px at 80% 80%, rgba(34,197,94,0.08), transparent)'
      }
    }}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 1200 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 6 }} sx={{ height: '100%' }}>
          {/* Left: title and years */}
          <Box sx={{ flex: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ 
                mb: 2, 
                color: 'var(--text-secondary)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: 'var(--text-primary)' }}>
              {subject ? subject.name : 'Pick a year'}
            </Typography>
            {subject && (
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                {subject.description}
              </Typography>
            )}

            {/* Compact badges */}
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
              <Button variant="outlined" size="small" startIcon={<QuizIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>Quizzes</Button>
              <Button variant="outlined" size="small" startIcon={<CalendarMonthIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>10 years</Button>
              <Button variant="outlined" size="small" startIcon={<InsightsIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>Review</Button>
            </Stack>

            {years.length > 0 ? (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.2 }}>
                {years.map(y => (
                  <Button
                    key={y}
                    variant="outlined"
                    onClick={() => navigate(`/exam/${examId}/years/${y}/quiz`)}
                    sx={{
                      px: 2,
                      minHeight: 46,
                      borderRadius: 999,
                      fontWeight: 800,
                      letterSpacing: 0.2,
                      textTransform: 'none',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    {y}
                  </Button>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No years available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please add questions for this exam in the Data Manager.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/data-manager')}
                  sx={{ borderRadius: 999, px: 4, py: 1.5 }}
                >
                  Go to Data Manager
                </Button>
              </Box>
            )}
          </Box>

          {/* Right: large illustration to fill vertical space on wide screens */}
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
            <CalendarMonthIcon sx={{ fontSize: 440, opacity: 0.06 }} />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}