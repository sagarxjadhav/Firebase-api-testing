// Auto-add data to Firebase - Run this in browser console or import in a component
import { bulkAddExamData } from '../firebase/examService.js';

// Complete exam data structure
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

// Function to add all data
export const addAllDataToFirebase = async () => {
  console.log('🚀 Starting bulk data addition to Firebase...');
  
  const results = [];
  
  for (const [examCode, examDataItem] of Object.entries(examData)) {
    try {
      console.log(`Adding ${examCode}...`);
      const result = await bulkAddExamData(examDataItem);
      results.push({
        examCode,
        ...result,
        success: true
      });
      console.log(`✅ ${examCode} added successfully:`, result);
    } catch (error) {
      console.error(`❌ Error adding ${examCode}:`, error);
      results.push({
        examCode,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('🎉 Bulk data addition completed!');
  console.table(results);
  
  // Check if all additions were successful
  const failedAdditions = results.filter(result => !result.success);
  if (failedAdditions.length === 0) {
    console.log('✅ All data added successfully to Firebase!');
    alert('✅ All data added successfully to Firebase!');
  } else {
    console.log(`❌ ${failedAdditions.length} additions failed:`, failedAdditions);
    alert(`❌ ${failedAdditions.length} additions failed. Check console for details.`);
  }
  
  return results;
};

// Auto-run when imported
if (typeof window !== 'undefined') {
  // Make it available globally
  window.addAllDataToFirebase = addAllDataToFirebase;
  console.log('Data addition function available on window.addAllDataToFirebase');
  
  // Auto-run after a short delay to ensure Firebase is initialized
  setTimeout(() => {
    console.log('Auto-running data addition...');
    addAllDataToFirebase();
  }, 2000);
}
