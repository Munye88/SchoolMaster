// Script to reset imageUrl fields for all KFNA instructors
import fetch from 'node-fetch';

async function resetKFNAInstructorImages() {
  try {
    // Get all instructors
    const response = await fetch('http://localhost:5000/api/instructors');
    const instructors = await response.json();
    
    // Filter for KFNA instructors (schoolId = 349)
    const kfnaInstructors = instructors.filter(instructor => instructor.schoolId === 349);
    
    console.log(`Found ${kfnaInstructors.length} KFNA instructors to reset images for.`);
    
    // Reset image for each instructor
    for (const instructor of kfnaInstructors) {
      console.log(`Resetting image for ${instructor.name} (ID: ${instructor.id})...`);
      
      // Update the instructor with empty imageUrl
      const updateResponse = await fetch(`http://localhost:5000/api/instructors/${instructor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: ''  // Reset to empty string
        }),
      });
      
      if (updateResponse.ok) {
        console.log(`✅ Successfully reset image for ${instructor.name}`);
      } else {
        console.error(`❌ Failed to reset image for ${instructor.name}`);
        console.error(await updateResponse.text());
      }
    }
    
    console.log('Done resetting images for KFNA instructors.');
  } catch (error) {
    console.error('Error resetting KFNA instructor images:', error);
  }
}

// Run the function
resetKFNAInstructorImages();