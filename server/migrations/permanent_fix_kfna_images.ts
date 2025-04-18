import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Known correct instructor IDs and names for KFNA
type InstructorPairing = {
  name: string;
  id: number;
  imageData: string | null;
};

const correctPairings: InstructorPairing[] = [
  { name: "Adam Clark", id: 6860, imageData: null },
  { name: "Brian Walker", id: 6861, imageData: null },
  { name: "Charles Davis", id: 6862, imageData: null },
  { name: "David Johnson", id: 6863, imageData: null },
  { name: "Eric Miller", id: 6864, imageData: null },
  { name: "Frank Wilson", id: 6865, imageData: null },
  { name: "Gregory Adams", id: 6866, imageData: null },
  { name: "Henry Thomas", id: 6867, imageData: null },
  { name: "Ian Robinson", id: 6868, imageData: null },
  { name: "John Smith", id: 6869, imageData: null },
  { name: "Kevin Williams", id: 6870, imageData: null },
  { name: "Larry Brown", id: 6871, imageData: null },
  { name: "Michael Lee", id: 6891, imageData: null },
  { name: "Nathan Martin", id: 6892, imageData: null },
  { name: "Oliver Young", id: 6893, imageData: null },
  { name: "Patrick Harris", id: 6894, imageData: null },
  { name: "Quentin Taylor", id: 6895, imageData: null },
  { name: "Robert Jones", id: 6896, imageData: null },
  { name: "Samuel White", id: 6897, imageData: null },
  { name: "Timothy Lewis", id: 6898, imageData: null }
];

// Function to permanently fix KFNA instructor image mismatches
export async function permanentFixKfnaImages() {
  try {
    console.log("Starting permanent fix for KFNA instructor image associations...");
    
    // Get all current instructors for KFNA (school ID 349)
    const currentInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 349)
    });
    
    console.log(`Found ${currentInstructors.length} KFNA instructors`);
    
    // First, record all current image URLs by name
    for (const instructor of currentInstructors) {
      const match = correctPairings.find(p => p.name === instructor.name);
      if (match) {
        match.imageData = instructor.imageUrl;
        console.log(`Stored image data for ${instructor.name}`);
      }
    }
    
    // Now update each instructor to have the correct images
    for (const pairing of correctPairings) {
      if (pairing.imageData) {
        await db
          .update(instructors)
          .set({ 
            imageUrl: pairing.imageData
          })
          .where(eq(instructors.id, pairing.id));
        
        console.log(`Updated image for ${pairing.name} (ID: ${pairing.id})`);
      } else {
        console.log(`WARNING: No image data found for ${pairing.name}`);
      }
    }
    
    // Add a flag to the database to indicate this permanent fix has been applied
    try {
      // Create a settings table if it doesn't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert or update the flag
      await db.execute(`
        INSERT INTO system_settings (key, value)
        VALUES ('kfna_images_fixed', 'true')
        ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = CURRENT_TIMESTAMP
      `);
      
      console.log("Added permanent fix flag to database");
    } catch (error) {
      console.error("Error adding permanent fix flag:", error);
    }
    
    console.log("KFNA instructor image associations fixed permanently");
  } catch (error) {
    console.error("Error with permanent fix for KFNA instructor images:", error);
    throw error;
  }
}