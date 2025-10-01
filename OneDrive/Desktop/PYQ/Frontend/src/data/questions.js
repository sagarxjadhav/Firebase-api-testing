import { getQuestionsForSubjectYear, getSubjectByCode, getYearsForSubject, getAllSubjects } from '../firebase/dataService';

// Legacy fallback data (minimal fallback for emergency cases)
const LEGACY_QUESTIONS = {
  'ssc-cgl': {
    2024: [
      { id: 'q1', q: 'What is the capital of India?', options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], ans: 1 },
      { id: 'q2', q: '2 + 2 = ?', options: ['3', '4', '5', '22'], ans: 1 },
    ],
    2023: [
      { id: 'q1', q: 'Largest planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], ans: 2 },
    ],
  },
  'upsc-prelims': {
    2024: [
      { id: 'q1', q: 'Right to Equality is in which Articles?', options: ['14-18', '19-22', '23-24', '25-28'], ans: 0 },
    ],
    2025: [
      { id: 'q1', q: "The term 'blue carbon' refers to carbon captured by which ecosystems?", options: ['Boreal forests', 'Mangroves, seagrasses and salt marshes', 'Coral reefs', 'Savannah grasslands'], ans: 1 },
      { id: 'q2', q: 'Which of the following is NOT a Directive Principle of State Policy?', options: ['Promotion of international peace', 'Uniform civil code', 'Freedom of trade, commerce and intercourse', 'Provision for early childhood care'], ans: 2 },
      { id: 'q3', q: "India's GDP at constant prices is used primarily to", options: ['Exclude net exports', 'Remove the effect of inflation', 'Account for population growth', 'Include informal sector'], ans: 1 },
      { id: 'q4', q: "A 'Money Bill' in India can be introduced only in", options: ['Rajya Sabha with recommendation', 'Lok Sabha with recommendation of the President', 'Joint sitting', 'Either House without recommendation'], ans: 1 },
      { id: 'q5', q: 'La Niña is best described as', options: ['Unusual warming of eastern Pacific', 'Unusual cooling of central and eastern Pacific', 'Weakening of Atlantic thermohaline circulation', 'Sudden stratospheric warming'], ans: 1 },
    ],
  },
}

/**
 * Get questions from Firebase for a specific subject and year
 * @param {string} subjectCode - Subject code (e.g., 'upsc-prelims')
 * @param {string|number} year - Year (e.g., 2025)
 * @returns {Promise<Array>} - Array of question objects
 */
export async function getQuestions(subjectCode, year) {
  try {
    // First, check if the subject exists
    const subject = await getSubjectByCode(subjectCode);
    
    if (!subject) {
      console.warn(`Subject with code '${subjectCode}' not found in Firebase, falling back to legacy data`);
      return getLegacyQuestions(subjectCode, year);
    }

    // Get questions from Firebase
    const questions = await getQuestionsForSubjectYear(subjectCode, year.toString());
    
    // Transform Firebase data to match the expected format
    return questions.map(q => ({
      id: q.questionId || q.id,
      q: q.question,
      options: q.options,
      ans: q.correctAnswer,
      questionImage: q.questionImage,
      optionImages: q.optionImages,
      explanation: q.explanation,
      difficulty: q.difficulty,
      subject: q.subject,
      topic: q.topic
    }));
  } catch (error) {
    console.error('Error fetching questions from Firebase:', error);
    console.warn('Falling back to legacy data');
    return getLegacyQuestions(subjectCode, year);
  }
}

/**
 * Get questions from legacy data (fallback)
 * @param {string} subjectCode - Subject code
 * @param {string|number} year - Year
 * @returns {Array} - Array of question objects
 */
function getLegacyQuestions(subjectCode, year) {
  const bySubject = LEGACY_QUESTIONS[subjectCode] || {};
  const list = bySubject[year] || [];
  return list;
}

/**
 * Get all available subject codes from Firebase
 * @returns {Promise<Array>} - Array of subject objects with code and name
 */
export async function getAvailableExams() {
  try {
    const subjects = await getAllSubjects();
    return subjects.map(subject => ({
      code: subject.code,
      name: subject.name,
      id: subject.id
    }));
  } catch (error) {
    console.error('Error fetching subjects from Firebase:', error);
    // Return legacy subject codes as fallback
    return Object.keys(LEGACY_QUESTIONS).map(code => ({
      code,
      name: code.replace('-', ' ').toUpperCase(),
      id: code
    }));
  }
}

/**
 * Get available years for a subject from Firebase
 * @param {string} subjectCode - Subject code
 * @returns {Promise<Array>} - Array of years
 */
export async function getAvailableYears(subjectCode) {
  try {
    console.log(`Getting years for subject: ${subjectCode}`);
    const subject = await getSubjectByCode(subjectCode);
    if (!subject) {
      console.log(`Subject ${subjectCode} not found in Firebase, using legacy data`);
      return Object.keys(LEGACY_QUESTIONS[subjectCode] || {});
    }

    console.log(`Subject ${subjectCode} found, getting years...`);
    const years = await getYearsForSubject(subjectCode);
    console.log(`Years found for ${subjectCode}:`, years);
    return years;
  } catch (error) {
    console.error('Error fetching years from Firebase:', error);
    return Object.keys(LEGACY_QUESTIONS[subjectCode] || {});
  }
}