import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Stack, Button, Typography, LinearProgress, Card, CardContent, Grid } from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import SchoolIcon from '@mui/icons-material/School'
import { getAllSubjects } from '../firebase/dataService'

export default function SubjectGrid() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true)
        console.log('Loading all subjects...')
        const subjectsData = await getAllSubjects()
        console.log('Subjects loaded:', subjectsData)
        setSubjects(subjectsData)
      } catch (error) {
        console.error('Error loading subjects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [])

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
          <Typography variant="h6">Loading subjects...</Typography>
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
      paddingTop: '64px',
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
        <Stack spacing={4} sx={{ height: '100%' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: 'var(--text-primary)' }}>
              Choose Your Exam
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)', maxWidth: 600, mx: 'auto' }}>
              Select the exam you want to practice and access years of previous question papers
            </Typography>
          </Box>

          {/* Subjects Grid */}
          {subjects.length > 0 ? (
            <Grid container spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
              {subjects.map(subject => (
                <Grid item xs={12} sm={6} md={4} key={subject.code}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                        borderColor: '#667eea'
                      }
                    }}
                    onClick={() => navigate(`/exam/${subject.code}/years`)}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: '#667eea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ color: 'var(--text-primary)' }}>
                            {subject.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            {subject.category?.toUpperCase() || 'EXAM'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ 
                        color: 'var(--text-secondary)', 
                        flex: 1,
                        mb: 2
                      }}>
                        {subject.description}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<QuizIcon />}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          backgroundColor: '#667eea',
                          '&:hover': {
                            backgroundColor: '#5a6fd8'
                          }
                        }}
                      >
                        Start Practice
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No subjects available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please add exam data in the Data Manager.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/data-manager')}
                sx={{ borderRadius: 2, px: 4, py: 1.5 }}
              >
                Go to Data Manager
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
