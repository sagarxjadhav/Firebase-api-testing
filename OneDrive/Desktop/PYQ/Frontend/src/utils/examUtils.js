// Utility functions for exam navigation based on user's selected exam

/**
 * Get the user's selected exam from localStorage
 * @returns {string|null} The selected exam or null if not found
 */
export const getUserSelectedExam = () => {
  try {
    const userData = localStorage.getItem('auth_user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.selectedExam || null
    }
  } catch (error) {
    console.error('Error getting user selected exam:', error)
  }
  return null
}

/**
 * Map exam names to their corresponding subject codes/IDs
 * @param {string} examName - The exam name from registration
 * @returns {string} The corresponding subject code for navigation
 */
export const mapExamToSubjectCode = (examName) => {
  const examMapping = {
    'JEE Mains': 'jee-mains',
    'JEE Advanced': 'jee-advanced', 
    'NEET': 'neet',
    'UPSC Prelims': 'upsc-prelims',
    'GATE': 'gate',
    'CAT': 'cat',
    'SSC': 'ssc-cgl',
    'Banking': 'banking',
    'Railway': 'railway',
    'Other': 'other'
  }
  
  return examMapping[examName] || 'jee-mains' // Default fallback
}

/**
 * Get the redirect URL for the user's selected exam
 * @returns {string} The URL to redirect to
 */
export const getExamRedirectUrl = () => {
  const selectedExam = getUserSelectedExam()
  
  if (!selectedExam) {
    // If no exam selected, go to subjects page to let them choose
    return '/subjects'
  }
  
  const subjectCode = mapExamToSubjectCode(selectedExam)
  // Go directly to years page for the selected exam
  return `/years/${subjectCode}`
}

/**
 * Get a user-friendly display name for the exam
 * @param {string} examName - The exam name from registration
 * @returns {string} A user-friendly display name
 */
export const getExamDisplayName = (examName) => {
  const displayNames = {
    'JEE Mains': 'JEE Mains',
    'JEE Advanced': 'JEE Advanced',
    'NEET': 'NEET',
    'UPSC Prelims': 'UPSC Prelims',
    'GATE': 'GATE',
    'CAT': 'CAT',
    'SSC': 'SSC CGL',
    'Banking': 'Banking',
    'Railway': 'Railway',
    'Other': 'Other'
  }
  
  return displayNames[examName] || examName || 'Your Exam'
}
