// Quick script to add data using the new structure
// Run this in your browser console on your app page

console.log('🚀 Adding data using new structure: data -> subjects -> years -> questions...');

// Import and run the data addition
import('./src/scripts/addDataNewStructure.js')
  .then(module => {
    const { addAllDataNewStructure } = module;
    return addAllDataNewStructure();
  })
  .then(results => {
    console.log('✅ Data addition completed!', results);
    
    const failedAdditions = results.filter(result => !result.success);
    if (failedAdditions.length === 0) {
      console.log('🎉 All data added successfully using new structure!');
      alert('✅ All data added successfully using new structure! Your app is now ready to use.');
      
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
