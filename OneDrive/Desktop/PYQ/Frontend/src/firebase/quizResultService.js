import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const QUIZ_RESULTS_COLLECTION = 'quizResults';

/**
 * Save quiz result for a user
 * @param {Object} resultData - Quiz result data
 * @param {string} resultData.userId - User ID
 * @param {string} resultData.userEmail - User email
 * @param {string} resultData.userName - User name
 * @param {string} resultData.subjectCode - Subject code (e.g., 'ssc-cgl')
 * @param {string} resultData.subjectName - Subject name (e.g., 'SSC CGL')
 * @param {string} resultData.year - Year (e.g., '2024')
 * @param {number} resultData.score - Number of correct answers
 * @param {number} resultData.totalQuestions - Total number of questions
 * @param {number} resultData.percentage - Percentage score
 * @param {number} resultData.timeSpent - Time spent in seconds
 * @param {Array} resultData.answers - Array of user answers
 * @param {Array} resultData.correctAnswers - Array of correct answers
 * @param {string} resultData.difficulty - Difficulty level
 * @returns {Promise<string>} - Document ID of saved result
 */
export const saveQuizResult = async (resultData) => {
  try {
    const result = {
      ...resultData,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, QUIZ_RESULTS_COLLECTION), result);
    console.log('Quiz result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
};

/**
 * Get all quiz results for a specific user
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of results to fetch (default: 50)
 * @returns {Promise<Array>} - Array of quiz results
 */
export const getUserQuizResults = async (userId, limitCount = 50) => {
  try {
    // Use a simpler query without orderBy to avoid index requirement
    const q = query(
      collection(db, QUIZ_RESULTS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by timestamp in JavaScript (descending)
    results = results.sort((a, b) => {
      const timestampA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
      const timestampB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
      return timestampB - timestampA;
    });

    // Apply limit after sorting
    results = results.slice(0, limitCount);

    console.log(`Found ${results.length} quiz results for user ${userId}`);
    return results;
  } catch (error) {
    console.error('Error getting user quiz results:', error);
    throw error;
  }
};

/**
 * Get quiz results for a specific subject and year
 * @param {string} userId - User ID
 * @param {string} subjectCode - Subject code
 * @param {string} year - Year
 * @returns {Promise<Array>} - Array of quiz results
 */
export const getUserQuizResultsBySubjectYear = async (userId, subjectCode, year) => {
  try {
    const q = query(
      collection(db, QUIZ_RESULTS_COLLECTION),
      where('userId', '==', userId),
      where('subjectCode', '==', subjectCode),
      where('year', '==', year),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${results.length} quiz results for ${subjectCode} - ${year}`);
    return results;
  } catch (error) {
    console.error('Error getting quiz results by subject/year:', error);
    throw error;
  }
};

/**
 * Get user's best score for a specific subject and year
 * @param {string} userId - User ID
 * @param {string} subjectCode - Subject code
 * @param {string} year - Year
 * @returns {Promise<Object|null>} - Best quiz result or null
 */
export const getUserBestScore = async (userId, subjectCode, year) => {
  try {
    const q = query(
      collection(db, QUIZ_RESULTS_COLLECTION),
      where('userId', '==', userId),
      where('subjectCode', '==', subjectCode),
      where('year', '==', year),
      orderBy('percentage', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const result = querySnapshot.docs[0];
    return {
      id: result.id,
      ...result.data()
    };
  } catch (error) {
    console.error('Error getting user best score:', error);
    throw error;
  }
};

/**
 * Get user's overall statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User statistics
 */
export const getUserStatistics = async (userId) => {
  try {
    const results = await getUserQuizResults(userId, 1000); // Get more results for stats
    
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
    const totalScore = results.reduce((sum, result) => sum + result.percentage, 0);
    const averageScore = Math.round(totalScore / totalQuizzes);
    const bestScore = Math.max(...results.map(result => result.percentage));
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
 * Delete a quiz result
 * @param {string} resultId - Result document ID
 * @returns {Promise<void>}
 */
export const deleteQuizResult = async (resultId) => {
  try {
    await deleteDoc(doc(db, QUIZ_RESULTS_COLLECTION, resultId));
    console.log('Quiz result deleted:', resultId);
  } catch (error) {
    console.error('Error deleting quiz result:', error);
    throw error;
  }
};

/**
 * Update a quiz result
 * @param {string} resultId - Result document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateQuizResult = async (resultId, updateData) => {
  try {
    const resultRef = doc(db, QUIZ_RESULTS_COLLECTION, resultId);
    await updateDoc(resultRef, {
      ...updateData,
      updatedAt: new Date()
    });
    console.log('Quiz result updated:', resultId);
  } catch (error) {
    console.error('Error updating quiz result:', error);
    throw error;
  }
};
