import { migrateAllDataToFirebase } from './migrateToFirebase.js';

// Run the migration
console.log('Starting data migration to Firebase...');
migrateAllDataToFirebase()
  .then((results) => {
    console.log('Migration completed successfully!');
    console.log('Results:', results);
    
    // Check if all migrations were successful
    const failedMigrations = results.filter(result => !result.success);
    if (failedMigrations.length === 0) {
      console.log('✅ All data migrated successfully!');
      console.log('You can now remove the data folder.');
    } else {
      console.log('❌ Some migrations failed:', failedMigrations);
    }
  })
  .catch((error) => {
    console.error('Migration failed:', error);
  });
