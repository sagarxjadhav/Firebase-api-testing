import fs from 'fs';
import path from 'path';

// Function to remove the data folder
export const removeDataFolder = () => {
  try {
    const dataFolderPath = path.join(process.cwd(), 'src', 'data');
    
    if (fs.existsSync(dataFolderPath)) {
      // Remove all files in the data folder
      const files = fs.readdirSync(dataFolderPath);
      files.forEach(file => {
        const filePath = path.join(dataFolderPath, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${file}`);
      });
      
      // Remove the data folder itself
      fs.rmdirSync(dataFolderPath);
      console.log('✅ Data folder removed successfully!');
      return true;
    } else {
      console.log('Data folder not found or already removed.');
      return true;
    }
  } catch (error) {
    console.error('Error removing data folder:', error);
    return false;
  }
};

// Function to check if migration was successful
export const checkMigrationStatus = async () => {
  try {
    const { getAllExams } = await import('../firebase/examService.js');
    const exams = await getAllExams();
    
    if (exams.length > 0) {
      console.log(`✅ Found ${exams.length} exams in Firebase`);
      return true;
    } else {
      console.log('❌ No exams found in Firebase');
      return false;
    }
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

// Main cleanup function
export const cleanupAfterMigration = async () => {
  console.log('Checking migration status...');
  const migrationSuccessful = await checkMigrationStatus();
  
  if (migrationSuccessful) {
    console.log('Migration successful, proceeding with cleanup...');
    const cleanupSuccessful = removeDataFolder();
    
    if (cleanupSuccessful) {
      console.log('🎉 Cleanup completed successfully!');
      console.log('Your data is now stored in Firebase and local data files have been removed.');
    }
  } else {
    console.log('❌ Migration not successful, skipping cleanup.');
  }
};

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - make functions available globally
  window.cleanupData = {
    removeDataFolder,
    checkMigrationStatus,
    cleanupAfterMigration
  };
  console.log('Cleanup functions available on window.cleanupData');
}
