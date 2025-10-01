// Direct script to add data to Firebase - Run this in browser console
console.log('🚀 Starting direct data addition to Firebase...');

// Import Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, doc, setDoc, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCGvGGOI3Y8QQTbP37frHVIrLdHsov70kc",
  authDomain: "pyqnew-72a6c.firebaseapp.com",
  projectId: "pyqnew-72a6c",
  storageBucket: "pyqnew-72a6c.firebasestorage.app",
  messagingSenderId: "164582211713",
  appId: "1:164582211713:web:44c3184a54dce4bee94d80",
  measurementId: "G-V2M7XTZTL2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data to add
const subjectsData = {
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
        },
        { 
          id: 'q3', 
          q: 'Which is the largest state in India by area?', 
          options: ['Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh'], 
          ans: 1 
        }
      ],
      '2023': [
        { 
          id: 'q1', 
          q: 'Largest planet in our solar system?', 
          options: ['Earth', 'Mars', 'Jupiter', 'Venus'], 
          ans: 2 
        }
      ]
    }
  },
  'jee-mains': {
    name: 'JEE Main Examination',
    code: 'jee-mains',
    description: 'Joint Entrance Examination Main',
    category: 'engineering',
    questions: {
      '2024': [
        { 
          id: 'q1', 
          q: 'What is the derivative of x²?', 
          options: ['x', '2x', 'x²', '2x²'], 
          ans: 1 
        },
        { 
          id: 'q2', 
          q: 'Which gas is most abundant in Earth\'s atmosphere?', 
          options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'], 
          ans: 1 
        }
      ]
    }
  },
  'neet': {
    name: 'NEET Examination',
    code: 'neet',
    description: 'National Eligibility cum Entrance Test',
    category: 'medical',
    questions: {
      '2024': [
        { 
          id: 'q1', 
          q: 'Which organelle is known as the powerhouse of the cell?', 
          options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'], 
          ans: 1 
        },
        { 
          id: 'q2', 
          q: 'What is the chemical formula of water?', 
          options: ['H2O', 'H2O2', 'H3O', 'HO2'], 
          ans: 0 
        }
      ]
    }
  }
};

// Function to add data
async function addDataToFirebase() {
  try {
    console.log('📊 Adding subjects to Firebase...');
    
    for (const [subjectCode, subjectData] of Object.entries(subjectsData)) {
      console.log(`Adding subject: ${subjectCode}`);
      
      // Add subject document
      const subjectRef = doc(db, 'data', subjectCode);
      await setDoc(subjectRef, {
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description,
        category: subjectData.category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Subject ${subjectCode} added`);
      
      // Add questions for each year
      for (const [year, questions] of Object.entries(subjectData.questions)) {
        console.log(`Adding questions for ${subjectCode} - ${year}`);
        
        for (const question of questions) {
          const questionRef = doc(collection(db, 'data', subjectCode, year));
          await setDoc(questionRef, {
            questionId: question.id,
            question: question.q,
            options: question.options,
            correctAnswer: question.ans,
            questionImage: null,
            optionImages: null,
            explanation: null,
            difficulty: 'medium',
            subject: null,
            topic: null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        console.log(`✅ Added ${questions.length} questions for ${subjectCode} - ${year}`);
      }
    }
    
    console.log('🎉 All data added successfully!');
    alert('✅ All data added successfully to Firebase! Check your console for details.');
    
  } catch (error) {
    console.error('❌ Error adding data:', error);
    alert('❌ Error adding data: ' + error.message);
  }
}

// Run the function
addDataToFirebase();
