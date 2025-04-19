import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Read the base64 encoded image data
const imageBase64 = fs.readFileSync('./instructor_image_base64.txt', 'utf-8');

// Add proper data URL prefix for JPEG image
const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

// Names of instructors to exclude
const excludeInstructors = [
  'Mohamud Abdulle',
  'Sadat Hussein',
  'Vacant',
  'Vacant '
];

async function main() {
  try {
    // Fetch all instructors from KFNA (school ID 349)
    const response = await fetch('http://localhost:5000/api/instructors');
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const instructors = await response.json();
    
    // Filter instructors by school ID 349 (KFNA) and exclude specified names
    const kfnaInstructors = instructors.filter(
      instructor => 
        instructor.schoolId === 349 && 
        !excludeInstructors.includes(instructor.name)
    );
    
    console.log(`Found ${kfnaInstructors.length} KFNA instructors to update`);
    
    // Update each instructor's profile image
    for (const instructor of kfnaInstructors) {
      console.log(`Updating image for ${instructor.name} (ID: ${instructor.id})...`);
      
      const updateResponse = await fetch(`http://localhost:5000/api/instructors/${instructor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageDataUrl
        }),
      });
      
      if (!updateResponse.ok) {
        console.error(`Failed to update ${instructor.name}: ${updateResponse.statusText}`);
        const errorText = await updateResponse.text();
        console.error(`Error details: ${errorText}`);
        continue;
      }
      
      const updatedInstructor = await updateResponse.json();
      console.log(`✅ Successfully updated ${updatedInstructor.name}`);
    }
    
    console.log('Profile image update complete!');
  } catch (error) {
    console.error('Error updating instructor images:', error);
  }
}

main();