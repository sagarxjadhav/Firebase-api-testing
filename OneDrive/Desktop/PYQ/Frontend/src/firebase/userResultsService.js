import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const USER_RESULTS_COLLECTION = 'userResults';

/**
 * Save quiz result for a user using email as document ID
 * @param {string} userEmail - User's email address
 * @param {Object} quizResult - Quiz result data
 * @returns {Promise<void>}
 */
export const saveUserQuizResult = async (userEmail, quizResult) => {
  try {
    console.log(`🔥 saveUserQuizResult called for: ${userEmail}`);
    console.log('📊 Quiz result data:', quizResult);
    
    const userDocRef = doc(db, USER_RESULTS_COLLECTION, userEmail);
    console.log('📄 Document reference created:', userDocRef.path);
    
    const userDoc = await getDoc(userDocRef);
    console.log('📖 Document exists:', userDoc.exists());
    
    const resultData = {
      ...quizResult,
      id: Date.now().toString(), // Unique ID for this quiz attempt
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    console.log('📝 Prepared result data:', resultData);
    
    if (userDoc.exists()) {
      console.log('📄 User document exists, updating...');
      // User document exists, add to results array
      await updateDoc(userDocRef, {
        results: arrayUnion(resultData),
        lastUpdated: serverTimestamp(),
        totalQuizzes: (userDoc.data().totalQuizzes || 0) + 1
      });
      console.log('✅ Document updated successfully');
    } else {
      console.log('📄 User document does not exist, creating new one...');
      // User document doesn't exist, create new one
      await setDoc(userDocRef, {
        userEmail: userEmail,
        results: [resultData],
        totalQuizzes: 1,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log('✅ New document created successfully');
    }
    
    console.log(`✅ Quiz result saved for user: ${userEmail}`);
    console.log('🎉 Collection "userResults" should now be visible in Firebase console!');
    return resultData.id;
  } catch (error) {
    console.error('❌ Error saving user quiz result:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

/**
 * Get all quiz results for a user by email
 * @param {string} userEmail - User's email address
 * @returns {Promise<Array>} - Array of quiz results
 */
export const getUserQuizResultsByEmail = async (userEmail) => {
  try {
    const userDocRef = doc(db, USER_RESULTS_COLLECTION, userEmail);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log(`No quiz results found for user: ${userEmail}`);
      return [];
    }
    
    const userData = userDoc.data();
    const results = userData.results || [];
    
    // Sort by timestamp (most recent first)
    results.sort((a, b) => {
      const timestampA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
      const timestampB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
      return timestampB - timestampA;
    });
    
    console.log(`Found ${results.length} quiz results for user: ${userEmail}`);
    return results;
  } catch (error) {
    console.error('Error getting user quiz results:', error);
    throw error;
  }
};

/**
 * Get user statistics by email
 * @param {string} userEmail - User's email address
 * @returns {Promise<Object>} - User statistics
 */
export const getUserStatisticsByEmail = async (userEmail) => {
  try {
    const results = await getUserQuizResultsByEmail(userEmail);
    
    if (results.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        subjectsAttempted: 0,
        recentActivity: []
      };
    }
    
    const totalQuizzes = results.length;
    const totalScore = results.reduce((sum, result) => sum + (result.percentage || 0), 0);
    const averageScore = Math.round(totalScore / totalQuizzes);
    const bestScore = Math.max(...results.map(result => result.percentage || 0));
    const totalTimeSpent = results.reduce((sum, result) => sum + (result.timeSpent || 0), 0);
    
    const subjectsAttempted = new Set(results.map(result => result.subjectCode)).size;
    
    const recentActivity = results.slice(0, 5).map(result => ({
      subject: result.subjectName,
      year: result.year,
      score: result.percentage,
      date: result.timestamp
    }));
    
    return {
      totalQuizzes,
      averageScore,
      bestScore,
      totalTimeSpent,
      subjectsAttempted,
      recentActivity
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
};

/**
 * Delete a specific quiz result by email and result ID
 * @param {string} userEmail - User's email address
 * @param {string} resultId - Quiz result ID to delete
 * @returns {Promise<void>}
 */
export const deleteUserQuizResult = async (userEmail, resultId) => {
  try {
    const userDocRef = doc(db, USER_RESULTS_COLLECTION, userEmail);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    const updatedResults = userData.results.filter(result => result.id !== resultId);
    
    await updateDoc(userDocRef, {
      results: updatedResults,
      totalQuizzes: updatedResults.length,
      lastUpdated: serverTimestamp()
    });
    
    console.log(`Quiz result ${resultId} deleted for user: ${userEmail}`);
  } catch (error) {
    console.error('Error deleting user quiz result:', error);
    throw error;
  }
};

/**
 * Get user email from localStorage
 * @returns {string|null} - User email or null
 */
export const getUserEmail = () => {
  try {
    return localStorage.getItem('user_email');
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};
