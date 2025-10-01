import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Container, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, Box, Divider, Avatar, Chip, Switch, FormControlLabel } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import QuizIcon from '@mui/icons-material/Quiz'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import StorageIcon from '@mui/icons-material/Storage'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Auth from './pages/Auth.jsx'
import YearGrid from './pages/YearGrid.jsx'
import Quiz from './pages/Quiz.jsx'
import Analysis from './pages/Analysis.jsx'
import Profile from './pages/Profile.jsx'
import AIChat from './pages/AIChat.jsx'
import DataManager from './pages/DataManager.jsx'
import SubjectGrid from './pages/SubjectGrid.jsx'
import { getCurrentUser, isUserAuthenticated } from './utils/authUtils'
import { getExamRedirectUrl, getExamDisplayName, getUserSelectedExam } from './utils/examUtils'
import { signOut } from 'firebase/auth'
import { auth } from './firebase/firebaseConfig'

function App() {
  return (
    <div className="app">
      <AppShell />
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup'
  const isExamRoute = location.pathname === '/exam'
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('darkMode')) || false } catch { return false }
  })
  const toggle = () => setOpen(v => !v)
  
  // Get user data using robust authentication check
  const user = getCurrentUser()
  
  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
  }
  
  // Apply dark mode styles
  useEffect(() => {
    if (darkMode) {
      document.documentElement.style.setProperty('--bg-primary', '#121212')
      document.documentElement.style.setProperty('--bg-secondary', '#1e1e1e')
      document.documentElement.style.setProperty('--text-primary', '#ffffff')
      document.documentElement.style.setProperty('--text-secondary', '#b0b0b0')
      document.documentElement.style.setProperty('--border-color', '#333333')
      document.body.style.backgroundColor = '#121212'
      document.body.style.color = '#ffffff'
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff')
      document.documentElement.style.setProperty('--bg-secondary', '#f8f9fa')
      document.documentElement.style.setProperty('--text-primary', '#212529')
      document.documentElement.style.setProperty('--text-secondary', '#6c757d')
      document.documentElement.style.setProperty('--border-color', '#dee2e6')
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#212529'
    }
  }, [darkMode])
  
  // Logout function
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth)
      console.log('Successfully signed out from Firebase')
    } catch (error) {
      console.error('Error signing out from Firebase:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_user')
      localStorage.removeItem('user_email')
      localStorage.removeItem('quiz_results')
      
      // Close sidebar
      setOpen(false)
      
      // Redirect to login page
      window.location.href = '/login'
    }
  }
  
  return (
    <Box sx={{ display: 'flex' }}>
      {!(isAuthRoute || isExamRoute) && (
        <AppBar 
          position="fixed" 
          elevation={0} 
          sx={{ 
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <Toolbar>
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={toggle} 
              sx={{ 
                mr: 1,
                color: 'var(--text-primary)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1,
                color: 'var(--text-primary)',
                fontWeight: 600
              }}
            >
              PYQ Practice
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Drawer 
        anchor="left" 
        open={open} 
        onClose={toggle} 
        sx={{ 
          '& .MuiDrawer-paper': { 
            width: 260, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderRight: '1px solid var(--border-color)'
          } 
        }}
      >
        
        {/* Profile Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid var(--border-color)' }}>
          <ListItemButton 
            component={Link} 
            to={user ? "/profile" : "/login"} 
            onClick={toggle}
            sx={{ 
              p: 0, 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: '#667eea', mr: 2, width: 40, height: 40 }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {user ? (user.name || user.email || 'Student') : 'Profile'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user ? user.email : 'Click to login'}
                </Typography>
              </Box>
            </Box>
          </ListItemButton>
        </Box>
        
        <List sx={{ flex: 1 }}>
          {user ? (
            <ListItemButton 
              component={Link} 
              to={getExamRedirectUrl()} 
              onClick={toggle}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              <ListItemIcon><QuizIcon /></ListItemIcon>
              <ListItemText 
                primary={getExamDisplayName(getUserSelectedExam()) || "Start Quiz"} 
                secondary={getUserSelectedExam() ? "Your selected exam" : "Choose an exam"}
              />
            </ListItemButton>
          ) : (
            <ListItemButton 
              component={Link} 
              to="/subjects" 
              onClick={toggle}
            >
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Browse Exams" />
            </ListItemButton>
          )}
          {user && (
            <ListItemButton component={Link} to="/ai-chat" onClick={toggle}>
              <ListItemIcon><SmartToyIcon /></ListItemIcon>
              <ListItemText primary="Use AI" />
            </ListItemButton>
          )}
          {user && (
            <ListItemButton component={Link} to="/data-manager" onClick={toggle}>
              <ListItemIcon><StorageIcon /></ListItemIcon>
              <ListItemText primary="Data Manager" />
            </ListItemButton>
          )}
          {user ? (
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          ) : (
            <ListItemButton component={Link} to="/login" onClick={toggle}>
              <ListItemIcon><QuizIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          )}
        </List>
        
        {/* Dark Mode Toggle at bottom */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <Box 
            onClick={handleDarkModeToggle}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 2,
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: '#667eea',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: darkMode ? '#667eea' : '#f39c12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease-in-out'
              }}>
                {darkMode ? (
                  <DarkModeIcon sx={{ color: 'white', fontSize: 20 }} />
                ) : (
                  <LightModeIcon sx={{ color: 'white', fontSize: 20 }} />
                )}
              </Box>
              <Box>
                <Typography variant="body1" sx={{ 
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}>
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem'
                }}>
                  {darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              width: 48,
              height: 24,
              borderRadius: 12,
              backgroundColor: darkMode ? '#667eea' : '#e0e0e0',
              position: 'relative',
              transition: 'all 0.3s ease-in-out',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 2,
                left: darkMode ? 26 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: 'white',
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }
            }} />
          </Box>
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        {!(isAuthRoute || isExamRoute) && <Toolbar />}
        <Container 
          maxWidth={isAuthRoute ? false : 'md'} 
          sx={{ 
            py: 0, 
            px: isAuthRoute || isExamRoute ? 0 : { xs: 1, sm: 2 }, 
            height: '100%', 
            overflow: 'hidden',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <Routes>
                        <Route path="/" element={<Gate />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/subjects" element={<SubjectGrid />} />
                        <Route path="/years/:examId" element={<YearGrid />} />
                        <Route path="/exam/:examId/years" element={<YearGrid />} />
                        <Route path="/exam/:examId/years/:year/quiz" element={<Quiz />} />
                        <Route path="/analysis" element={<Analysis />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/ai-chat" element={<AIChat />} />
                        <Route path="/data-manager" element={<DataManager />} />
                        <Route path="*" element={<Navigate to="/subjects" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}

export default App

function Gate() {
  const user = getCurrentUser()
  if (isUserAuthenticated()) {
    // Navigate to subjects page to show all available exams
    return <Navigate to="/subjects" replace />
  }
  return <Auth />
}
