// Simple Node.js script to migrate data and cleanup
import { readFileSync, existsSync, unlinkSync, rmdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the data files
const dataPath = join(__dirname, 'src', 'data');
const dataJsonPath = join(dataPath, 'data.json');
const questionsJsPath = join(dataPath, 'questions.js');

console.log('🚀 Starting data migration and cleanup process...');

// Check if data files exist
if (!existsSync(dataJsonPath) && !existsSync(questionsJsPath)) {
  console.log('❌ No data files found to migrate.');
  process.exit(1);
}

console.log('📁 Found data files, proceeding with migration...');

// Read the data
let examData = {};
try {
  if (existsSync(dataJsonPath)) {
    const dataJson = readFileSync(dataJsonPath, 'utf8');
    examData = JSON.parse(dataJson);
    console.log('✅ Loaded data.json');
  }
} catch (error) {
  console.error('❌ Error reading data.json:', error.message);
}

// Transform the data to match our Firebase structure
const transformedData = {};

for (const [examCode, examInfo] of Object.entries(examData)) {
  if (typeof examInfo === 'object' && examInfo !== null) {
    // Check if this is the new structure with years
    if (examInfo['2025'] || examInfo['2024'] || examInfo['2023']) {
      // This is the new structure with years
      transformedData[examCode] = {
        name: getExamName(examCode),
        code: examCode,
        description: getExamDescription(examCode),
        category: getExamCategory(examCode),
        questions: examInfo
      };
    }
  }
}

// Helper functions to get exam details
function getExamName(code) {
  const names = {
    'upsc-prelims': 'UPSC Civil Services Preliminary Examination',
    'ssc-cgl': 'SSC Combined Graduate Level Examination',
    'jee-mains': 'JEE Main Examination',
    'neet': 'NEET Examination'
  };
  return names[code] || code.replace('-', ' ').toUpperCase();
}

function getExamDescription(code) {
  const descriptions = {
    'upsc-prelims': 'Union Public Service Commission Civil Services Preliminary Examination',
    'ssc-cgl': 'Staff Selection Commission Combined Graduate Level Examination',
    'jee-mains': 'Joint Entrance Examination Main',
    'neet': 'National Eligibility cum Entrance Test'
  };
  return descriptions[code] || `${code} examination`;
}

function getExamCategory(code) {
  if (code.includes('upsc')) return 'civil-services';
  if (code.includes('ssc')) return 'ssc';
  if (code.includes('jee')) return 'engineering';
  if (code.includes('neet')) return 'medical';
  return 'general';
}

console.log('📊 Transformed data structure:');
console.log('Exams to migrate:', Object.keys(transformedData));
Object.entries(transformedData).forEach(([code, data]) => {
  const totalQuestions = Object.values(data.questions).flat().length;
  console.log(`  - ${data.name}: ${totalQuestions} questions across ${Object.keys(data.questions).length} years`);
});

// Create a simple migration script that can be run in the browser
const migrationScript = `
// Auto-generated migration script
console.log('🔄 Starting automatic data migration...');

// Import the migration function
import { migrateAllDataToFirebase } from './src/scripts/migrateToFirebase.js';

// Run migration
migrateAllDataToFirebase()
  .then((results) => {
    console.log('✅ Migration completed!', results);
    
    // Check if all migrations were successful
    const failedMigrations = results.filter(result => !result.success);
    if (failedMigrations.length === 0) {
      console.log('🎉 All data migrated successfully!');
      console.log('You can now safely remove the data folder.');
      
      // Show instructions for manual cleanup
      console.log('\\n📋 To complete the cleanup:');
      console.log('1. Go to your app and navigate to /data-manager');
      console.log('2. Click "Clean Up Local Data Files" button');
      console.log('3. Or manually delete the src/data folder');
    } else {
      console.log('❌ Some migrations failed:', failedMigrations);
    }
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
  });
`;

// Write the migration script
const migrationScriptPath = join(__dirname, 'run-migration.js');
try {
  require('fs').writeFileSync(migrationScriptPath, migrationScript);
  console.log('✅ Created migration script: run-migration.js');
} catch (error) {
  console.error('❌ Error creating migration script:', error.message);
}

console.log('\\n🎯 Next steps:');
console.log('1. Open your app in the browser');
console.log('2. Navigate to /data-manager');
console.log('3. The migration will run automatically');
console.log('4. Click "Clean Up Local Data Files" to remove the data folder');
console.log('\\n✨ Your data will be safely stored in Firebase!');

// Show the data that will be migrated
console.log('\\n📋 Data to be migrated:');
Object.entries(transformedData).forEach(([code, data]) => {
  console.log(`\\n${data.name} (${code}):`);
  Object.entries(data.questions).forEach(([year, questions]) => {
    console.log(`  ${year}: ${questions.length} questions`);
  });
});
