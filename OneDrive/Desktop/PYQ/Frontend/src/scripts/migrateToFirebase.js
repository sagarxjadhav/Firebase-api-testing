import { bulkAddExamData } from '../firebase/examService.js';

// Your existing data structure
const examData = {
  'upsc-prelims': {
    name: 'UPSC Civil Services Preliminary Examination',
    code: 'upsc-prelims',
    description: 'Union Public Service Commission Civil Services Preliminary Examination',
    category: 'civil-services',
    questions: {
      '2025': [
        {
          id: 'q1',
          q: "The term 'blue carbon' refers to carbon captured by which ecosystems?",
          options: [
            'Boreal forests',
            'Mangroves, seagrasses and salt marshes',
            'Coral reefs',
            'Savannah grasslands'
          ],
          ans: 1
        },
        {
          id: 'q2',
          q: 'Which of the following is NOT a Directive Principle of State Policy?',
          options: [
            'Promotion of international peace',
            'Uniform civil code',
            'Freedom of trade, commerce and intercourse',
            'Provision for early childhood care'
          ],
          ans: 2
        },
        {
          id: 'q3',
          q: "India's GDP at constant prices is used primarily to",
          options: [
            'Exclude net exports',
            'Remove the effect of inflation',
            'Account for population growth',
            'Include informal sector'
          ],
          ans: 1
        },
        {
          id: 'q4',
          q: "A 'Money Bill' in India can be introduced only in",
          options: [
            'Rajya Sabha with recommendation',
            'Lok Sabha with recommendation of the President',
            'Joint sitting',
            'Either House without recommendation'
          ],
          ans: 1
        },
        {
          id: 'q5',
          q: 'La Niña is best described as',
          options: [
            'Unusual warming of eastern Pacific',
            'Unusual cooling of central and eastern Pacific',
            'Weakening of Atlantic thermohaline circulation',
            'Sudden stratospheric warming'
          ],
          ans: 1
        },
        {
          id: 'q6',
          q: "The 'PM-PRANAM' scheme is primarily related to",
          options: [
            'Reducing fertilizer usage and promoting alternate nutrients',
            'Providing rural drinking water',
            'Ayushman Bharat health coverage',
            'Railway modernization'
          ],
          ans: 0
        },
        {
          id: 'q7',
          q: "In the context of biodiversity, a 'keystone species' is",
          options: [
            'A species with the largest population',
            'A species whose removal causes major ecosystem changes',
            'A species introduced to restore habitats',
            'A flagship species used for campaigns'
          ],
          ans: 1
        },
        {
          id: 'q8',
          q: 'Which body prepares National Income estimates in India?',
          options: [
            'Reserve Bank of India',
            'NITI Aayog',
            'National Statistical Office',
            'Department of Economic Affairs'
          ],
          ans: 2
        },
        {
          id: 'q9',
          q: "The 'basic structure' doctrine was propounded in",
          options: [
            'Golaknath case',
            'Kesavananda Bharati case',
            'Minerva Mills case',
            'SR Bommai case'
          ],
          ans: 1
        },
        {
          id: 'q10',
          q: "'Green Hydrogen' is produced by",
          options: [
            'Electrolysis of water using renewable energy',
            'Steam reforming of natural gas',
            'Coal gasification',
            'Partial oxidation of heavy oil'
          ],
          ans: 0
        }
      ]
    }
  },
  'ssc-cgl': {
    name: 'SSC Combined Graduate Level Examination',
    code: 'ssc-cgl',
    description: 'Staff Selection Commission Combined Graduate Level Examination',
    category: 'ssc',
    questions: {
      '2024': [
        { 
          id: 'q1', 
          q: 'What is the capital of India?', 
          options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], 
          ans: 1 
        },
        { 
          id: 'q2', 
          q: '2 + 2 = ?', 
          options: ['3', '4', '5', '22'], 
          ans: 1 
        }
      ],
      '2023': [
        { 
          id: 'q1', 
          q: 'Largest planet?', 
          options: ['Earth', 'Mars', 'Jupiter', 'Venus'], 
          ans: 2 
        }
      ]
    }
  }
};

/**
 * Migrate all exam data to Firebase
 */
export const migrateAllDataToFirebase = async () => {
  console.log('Starting data migration to Firebase...');
  
  const results = [];
  
  for (const [examCode, examData] of Object.entries(examData)) {
    try {
      console.log(`Migrating ${examCode}...`);
      const result = await bulkAddExamData(examData);
      results.push({
        examCode,
        ...result,
        success: true
      });
      console.log(`✅ ${examCode} migrated successfully:`, result);
    } catch (error) {
      console.error(`❌ Error migrating ${examCode}:`, error);
      results.push({
        examCode,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('Migration completed!');
  console.table(results);
  return results;
};

/**
 * Add a single exam to Firebase
 * @param {string} examCode - The exam code to migrate
 */
export const migrateSingleExam = async (examCode) => {
  if (!examData[examCode]) {
    throw new Error(`Exam code '${examCode}' not found in data`);
  }
  
  console.log(`Migrating ${examCode}...`);
  const result = await bulkAddExamData(examData[examCode]);
  console.log(`✅ ${examCode} migrated successfully:`, result);
  return result;
};

// Example usage functions
export const addNewExam = async (examInfo) => {
  const newExamData = {
    name: examInfo.name,
    code: examInfo.code,
    description: examInfo.description || '',
    category: examInfo.category || 'general',
    questions: examInfo.questions || {}
  };
  
  return await bulkAddExamData(newExamData);
};

export const addQuestionsToExistingExam = async (examCode, year, questions) => {
  // First get the exam ID
  const { getExamByCode } = await import('../firebase/examService.js');
  const exam = await getExamByCode(examCode);
  
  if (!exam) {
    throw new Error(`Exam with code '${examCode}' not found`);
  }
  
  // Add questions for the year
  const { addQuestionsForYear } = await import('../firebase/examService.js');
  return await addQuestionsForYear(exam.id, year, questions);
};

// Auto-migrate when this module is imported (for testing)
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.migrateToFirebase = {
    migrateAllDataToFirebase,
    migrateSingleExam,
    addNewExam,
    addQuestionsToExistingExam
  };
  
  console.log('Migration functions available on window.migrateToFirebase');
}
