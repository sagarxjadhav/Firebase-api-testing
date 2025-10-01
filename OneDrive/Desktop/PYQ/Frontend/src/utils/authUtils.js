import { auth } from '../firebase/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'

/**
 * Get current user data from Firebase auth or localStorage
 * @returns {Object|null} User data or null
 */
export const getCurrentUser = () => {
  try {
    // First try localStorage
    const localUser = localStorage.getItem('auth_user')
    if (localUser) {
      const userData = JSON.parse(localUser)
      if (userData.uid) {
        return userData
      }
    }
    
    // If no localStorage data, return null
    // The app will handle authentication state
    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Store user data in localStorage
 * @param {Object} userData - User data to store
 */
export const storeUserData = (userData) => {
  try {
    localStorage.setItem('auth_user', JSON.stringify(userData))
    console.log('User data stored:', userData)
  } catch (error) {
    console.error('Error storing user data:', error)
  }
}

/**
 * Clear user data from localStorage
 */
export const clearUserData = () => {
  try {
    localStorage.removeItem('auth_user')
    console.log('User data cleared')
  } catch (error) {
    console.error('Error clearing user data:', error)
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isUserAuthenticated = () => {
  const user = getCurrentUser()
  return user && user.uid
}

/**
 * Get user ID for Firebase operations
 * @returns {string|null} User ID or null
 */
export const getUserId = () => {
  const user = getCurrentUser()
  return user?.uid || null
}
