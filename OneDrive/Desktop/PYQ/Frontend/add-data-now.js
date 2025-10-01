// Quick script to add data to Firebase
// Run this in your browser console on your app page

console.log('🚀 Adding data to Firebase...');

// Import and run the data addition
import('./src/scripts/autoAddData.js')
  .then(module => {
    const { addAllDataToFirebase } = module;
    return addAllDataToFirebase();
  })
  .then(results => {
    console.log('✅ Data addition completed!', results);
    
    const failedAdditions = results.filter(result => !result.success);
    if (failedAdditions.length === 0) {
      console.log('🎉 All data added successfully to Firebase!');
      alert('✅ All data added successfully to Firebase! Your app is now ready to use.');
      
      // Refresh the page to see the changes
      window.location.reload();
    } else {
      console.log(`❌ ${failedAdditions.length} additions failed:`, failedAdditions);
      alert(`❌ ${failedAdditions.length} additions failed. Check console for details.`);
    }
  })
  .catch(error => {
    console.error('❌ Error adding data:', error);
    alert('❌ Error adding data. Check console for details.');
  });
