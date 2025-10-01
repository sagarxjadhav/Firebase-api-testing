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
  writeBatch
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Collection names
const EXAMS_COLLECTION = 'exams';
const QUESTIONS_COLLECTION = 'questions';

/**
 * Add a new exam to Firebase
 * @param {Object} examData - Exam data object
 * @param {string} examData.name - Exam name (e.g., "UPSC Prelims")
 * @param {string} examData.code - Exam code (e.g., "upsc-prelims")
 * @param {string} examData.description - Exam description
 * @param {string} examData.category - Exam category
 * @returns {Promise<string>} - Document ID of the created exam
 */
export const addExam = async (examData) => {
  try {
    const examRef = await addDoc(collection(db, EXAMS_COLLECTION), {
      name: examData.name,
      code: examData.code,
      description: examData.description || '',
      category: examData.category || 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return examRef.id;
  } catch (error) {
    console.error('Error adding exam:', error);
    throw error;
  }
};

/**
 * Add questions for a specific exam and year
 * @param {string} examId - Firebase document ID of the exam
 * @param {string} year - Year (e.g., "2025")
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Array>} - Array of document IDs of created questions
 */
export const addQuestionsForYear = async (examId, year, questions) => {
  try {
    const batch = writeBatch(db);
    const questionIds = [];

    questions.forEach((question) => {
      const questionRef = doc(collection(db, QUESTIONS_COLLECTION));
      questionIds.push(questionRef.id);
      
      batch.set(questionRef, {
        examId: examId,
        year: year,
        questionId: question.id || questionRef.id,
        question: question.q,
        options: question.options,
        correctAnswer: question.ans,
        questionImage: question.questionImage || null,
        optionImages: question.optionImages || null, // Array of image URLs for each option
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
 * Get all exams
 * @returns {Promise<Array>} - Array of exam documents
 */
export const getAllExams = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, EXAMS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting exams:', error);
    throw error;
  }
};

/**
 * Get questions for a specific exam and year
 * @param {string} examId - Firebase document ID of the exam
 * @param {string} year - Year
 * @returns {Promise<Array>} - Array of question documents
 */
export const getQuestionsForExamYear = async (examId, year) => {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where('examId', '==', examId),
      where('year', '==', year),
      orderBy('questionId')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

/**
 * Get all years available for an exam
 * @param {string} examId - Firebase document ID of the exam
 * @returns {Promise<Array>} - Array of unique years
 */
export const getYearsForExam = async (examId) => {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      where('examId', '==', examId)
    );
    
    const querySnapshot = await getDocs(q);
    const years = [...new Set(querySnapshot.docs.map(doc => doc.data().year))];
    return years.sort((a, b) => b - a); // Sort descending (newest first)
  } catch (error) {
    console.error('Error getting years:', error);
    throw error;
  }
};

/**
 * Get exam by code
 * @param {string} examCode - Exam code (e.g., "upsc-prelims")
 * @returns {Promise<Object|null>} - Exam document or null
 */
export const getExamByCode = async (examCode) => {
  try {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('code', '==', examCode)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting exam by code:', error);
    throw error;
  }
};

/**
 * Update a question
 * @param {string} questionId - Firebase document ID of the question
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateQuestion = async (questionId, updateData) => {
  try {
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
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
 * @param {string} questionId - Firebase document ID of the question
 * @returns {Promise<void>}
 */
export const deleteQuestion = async (questionId) => {
  try {
    await deleteDoc(doc(db, QUESTIONS_COLLECTION, questionId));
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

/**
 * Bulk add exam data (exam + all years + all questions)
 * @param {Object} examData - Complete exam data structure
 * @returns {Promise<Object>} - Result object with examId and question counts
 */
export const bulkAddExamData = async (examData) => {
  try {
    // First, add the exam
    const examId = await addExam({
      name: examData.name,
      code: examData.code,
      description: examData.description || '',
      category: examData.category || 'general'
    });

    const result = {
      examId,
      yearsAdded: 0,
      totalQuestions: 0
    };

    // Then add questions for each year
    for (const [year, questions] of Object.entries(examData.questions)) {
      if (Array.isArray(questions) && questions.length > 0) {
        await addQuestionsForYear(examId, year, questions);
        result.yearsAdded++;
        result.totalQuestions += questions.length;
      }
    }

    return result;
  } catch (error) {
    console.error('Error in bulk add exam data:', error);
    throw error;
  }
};
