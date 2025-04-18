import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Known correct instructor IDs and names for NFS East
type InstructorPairing = {
  name: string;
  id: number;
  imageData: string | null;
};

const correctPairings: InstructorPairing[] = [
  { name: "Omar Obsiye", id: 6890, imageData: null },
  { name: "Abdibasid Barre", id: 6885, imageData: null },
  { name: "Muhidin Sheikh", id: 6876, imageData: null },
  { name: "Aaron N'diaye", id: 6877, imageData: null },
  { name: "Rafiq Abdul-Alim", id: 6875, imageData: null },
  { name: "Abdulaziz Yusuf", id: 6887, imageData: null },
  { name: "Shamell Hurd", id: 6888, imageData: null },
  { name: "Jose Montalvo", id: 6878, imageData: null },
  { name: "Shah Nawaz", id: 6873, imageData: null },
  { name: "Abukar Bashir", id: 6884, imageData: null },
  { name: "Paul Moss", id: 6872, imageData: null },
  { name: "Matthew Drake", id: 6882, imageData: null },
  { name: "Dahir Adani", id: 6883, imageData: null },
  { name: "Mohamed Mohamed", id: 6874, imageData: null },
  { name: "Said Ibrahim", id: 6886, imageData: null },
  { name: "Musab Ahmed", id: 6879, imageData: null },
  { name: "Afrim Trelak", id: 6880, imageData: null }
];

// Function to permanently fix NFS East instructor image mismatches
export async function permanentFixNfsEastImages() {
  try {
    console.log("Starting permanent fix for NFS East instructor image associations...");
    
    // Get all current instructors for NFS East (school ID 350)
    const currentInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 350)
    });
    
    console.log(`Found ${currentInstructors.length} NFS East instructors`);
    
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
    // This will help prevent re-running problematic scripts in the future
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
        VALUES ('nfs_east_images_fixed', 'true')
        ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = CURRENT_TIMESTAMP
      `);
      
      console.log("Added permanent fix flag to database");
    } catch (error) {
      console.error("Error adding permanent fix flag:", error);
    }
    
    console.log("NFS East instructor image associations fixed permanently");
  } catch (error) {
    console.error("Error with permanent fix for NFS East instructor images:", error);
    throw error;
  }
}