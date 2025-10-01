import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Collection structure: data -> {subjectId} -> {year} -> {questionId}
const DATA_COLLECTION = 'data';

/**
 * Add a new subject to the data collection
 * @param {Object} subjectData - Subject data object
 * @param {string} subjectData.name - Subject name (e.g., "UPSC Prelims")
 * @param {string} subjectData.code - Subject code (e.g., "upsc-prelims")
 * @param {string} subjectData.description - Subject description
 * @param {string} subjectData.category - Subject category
 * @returns {Promise<string>} - Document ID of the created subject
 */
export const addSubject = async (subjectData) => {
  try {
    const subjectRef = doc(collection(db, DATA_COLLECTION), subjectData.code);
    await setDoc(subjectRef, {
      name: subjectData.name,
      code: subjectData.code,
      description: subjectData.description || '',
      category: subjectData.category || 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return subjectRef.id;
  } catch (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
};

/**
 * Add questions for a specific subject and year
 * @param {string} subjectCode - Subject code (e.g., "upsc-prelims")
 * @param {string} year - Year (e.g., "2025")
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Array>} - Array of document IDs of created questions
 */
export const addQuestionsForSubjectYear = async (subjectCode, year, questions) => {
  try {
    const batch = writeBatch(db);
    const questionIds = [];

    questions.forEach((question) => {
      const questionRef = doc(collection(db, DATA_COLLECTION, subjectCode, year));
      questionIds.push(questionRef.id);
      
      batch.set(questionRef, {
        questionId: question.id || questionRef.id,
        question: question.q,
        options: question.options,
        correctAnswer: question.ans,
        questionImage: question.questionImage || null,
        optionImages: question.optionImages || null,
        explanation: question.explanation || null,
        difficulty: question.difficulty || 'medium',
        subject: question.subject || null,
        topic: question.topic || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await batch.commit();
    return questionIds;
  } catch (error) {
    console.error('Error adding questions:', error);
    throw error;
  }
};

/**
 * Get all subjects
 * @returns {Promise<Array>} - Array of subject documents
 */
export const getAllSubjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, DATA_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting subjects:', error);
    throw error;
  }
};

/**
 * Get questions for a specific subject and year
 * @param {string} subjectCode - Subject code (e.g., "upsc-prelims")
 * @param {string} year - Year
 * @returns {Promise<Array>} - Array of question documents
 */
export const getQuestionsForSubjectYear = async (subjectCode, year) => {
  try {
    console.log(`Getting questions for ${subjectCode} - ${year}`);
    
    const q = query(
      collection(db, DATA_COLLECTION, subjectCode, year),
      orderBy('questionId')
    );
    
    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${questions.length} questions for ${subjectCode} - ${year}`);
    return questions;
  } catch (error) {
    console.error('Error getting questions:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

/**
 * Get all years available for a subject
 * @param {string} subjectCode - Subject code
 * @returns {Promise<Array>} - Array of unique years
 */
export const getYearsForSubject = async (subjectCode) => {
  try {
    console.log(`Getting years for subject: ${subjectCode}`);
    
    const subjectRef = doc(db, DATA_COLLECTION, subjectCode);
    const subjectDoc = await getDoc(subjectRef);
    
    if (!subjectDoc.exists()) {
      console.log(`Subject ${subjectCode} not found`);
      return [];
    }

    console.log(`Subject ${subjectCode} exists, checking for years...`);
    
    // Get all subcollections (years) for this subject
    // We need to check what years actually exist by looking at the subcollections
    const years = [];
    
    // Try to get questions from common years to see which ones exist
    const commonYears = ['2025', '2024', '2023', '2022', '2021'];
    
    for (const year of commonYears) {
      try {
        console.log(`Checking year ${year} for subject ${subjectCode}...`);
        const yearQuery = query(collection(db, DATA_COLLECTION, subjectCode, year));
        const yearSnapshot = await getDocs(yearQuery);
        
        if (!yearSnapshot.empty) {
          years.push(year);
          console.log(`✅ Found year ${year} for subject ${subjectCode} with ${yearSnapshot.size} questions`);
        } else {
          console.log(`❌ Year ${year} is empty for subject ${subjectCode}`);
        }
      } catch (error) {
        // Year doesn't exist, continue to next
        console.log(`❌ Year ${year} doesn't exist for subject ${subjectCode}:`, error.message);
      }
    }
    
    console.log(`📅 Years found for ${subjectCode}:`, years);
    return years.sort((a, b) => b - a); // Sort descending (newest first)
  } catch (error) {
    console.error('Error getting years:', error);
    throw error;
  }
};

/**
 * Get subject by code
 * @param {string} subjectCode - Subject code (e.g., "upsc-prelims")
 * @returns {Promise<Object|null>} - Subject document or null
 */
export const getSubjectByCode = async (subjectCode) => {
  try {
    console.log(`Looking for subject with code: ${subjectCode}`);
    const subjectRef = doc(db, DATA_COLLECTION, subjectCode);
    const subjectDoc = await getDoc(subjectRef);
    
    if (!subjectDoc.exists()) {
      console.log(`Subject ${subjectCode} not found in Firebase`);
      return null;
    }
    
    const subjectData = {
      id: subjectDoc.id,
      ...subjectDoc.data()
    };
    console.log(`Found subject:`, subjectData);
    return subjectData;
  } catch (error) {
    console.error('Error getting subject by code:', error);
    throw error;
  }
};

/**
 * Update a question
 * @param {string} subjectCode - Subject code
 * @param {string} year - Year
 * @param {string} questionId - Question document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateQuestion = async (subjectCode, year, questionId, updateData) => {
  try {
    const questionRef = doc(db, DATA_COLLECTION, subjectCode, year, questionId);
    await updateDoc(questionRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

/**
 * Delete a question
 * @param {string} subjectCode - Subject code
 * @param {string} year - Year
 * @param {string} questionId - Question document ID
 * @returns {Promise<void>}
 */
export const deleteQuestion = async (subjectCode, year, questionId) => {
  try {
    await deleteDoc(doc(db, DATA_COLLECTION, subjectCode, year, questionId));
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

/**
 * Bulk add subject data (subject + all years + all questions)
 * @param {Object} subjectData - Complete subject data structure
 * @returns {Promise<Object>} - Result object with subjectId and question counts
 */
export const bulkAddSubjectData = async (subjectData) => {
  try {
    // First, add the subject
    const subjectId = await addSubject({
      name: subjectData.name,
      code: subjectData.code,
      description: subjectData.description || '',
      category: subjectData.category || 'general'
    });

    const result = {
      subjectId,
      yearsAdded: 0,
      totalQuestions: 0
    };

    // Then add questions for each year
    for (const [year, questions] of Object.entries(subjectData.questions)) {
      if (Array.isArray(questions) && questions.length > 0) {
        await addQuestionsForSubjectYear(subjectId, year, questions);
        result.yearsAdded++;
        result.totalQuestions += questions.length;
      }
    }

    return result;
  } catch (error) {
    console.error('Error in bulk add subject data:', error);
    throw error;
  }
};
