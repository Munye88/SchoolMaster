import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Known correct instructor IDs and names for NFS West
type InstructorPairing = {
  name: string;
  id: number;
  imageData: string | null;
};

const correctPairings: InstructorPairing[] = [
  { name: "Abdul Rahman", id: 6899, imageData: null },
  { name: "Ali Hassan", id: 6900, imageData: null },
  { name: "Badr Ahmad", id: 6901, imageData: null },
  { name: "Fahad Mohammed", id: 6902, imageData: null },
  { name: "Hakim Abdullah", id: 6903, imageData: null },
  { name: "Jamal Yusuf", id: 6904, imageData: null },
  { name: "Khalid Omar", id: 6905, imageData: null },
  { name: "Malik Ibrahim", id: 6906, imageData: null },
  { name: "Nasser Ali", id: 6907, imageData: null },
  { name: "Omar Saeed", id: 6908, imageData: null },
  { name: "Rashid Mohamed", id: 6909, imageData: null },
  { name: "Saeed Ahmed", id: 6910, imageData: null },
  { name: "Tariq Abdullah", id: 6911, imageData: null },
  { name: "Waleed Khan", id: 6912, imageData: null },
  { name: "Youssef Ibrahim", id: 6913, imageData: null },
  { name: "Zaki Hassan", id: 6914, imageData: null },
  { name: "Ahmed Farah", id: 6915, imageData: null },
  { name: "Bilal Samatar", id: 6916, imageData: null },
  { name: "Daoud Mohammed", id: 6917, imageData: null },
  { name: "Elmi Abdullahi", id: 6918, imageData: null },
  { name: "Faisal Omar", id: 6919, imageData: null },
  { name: "Ghedi Ali", id: 6920, imageData: null },
  { name: "Hassan Ibrahim", id: 6921, imageData: null },
  { name: "Ismail Yusuf", id: 6922, imageData: null },
  { name: "Jamaal Ahmed", id: 6923, imageData: null },
  { name: "Kadir Hussein", id: 6924, imageData: null },
  { name: "Liban Abdi", id: 6925, imageData: null }
];

// Function to permanently fix NFS West instructor image mismatches
export async function permanentFixNfsWestImages() {
  try {
    console.log("Starting permanent fix for NFS West instructor image associations...");
    
    // Get all current instructors for NFS West (school ID 351)
    const currentInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 351)
    });
    
    console.log(`Found ${currentInstructors.length} NFS West instructors`);
    
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
        VALUES ('nfs_west_images_fixed', 'true')
        ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = CURRENT_TIMESTAMP
      `);
      
      console.log("Added permanent fix flag to database");
    } catch (error) {
      console.error("Error adding permanent fix flag:", error);
    }
    
    console.log("NFS West instructor image associations fixed permanently");
  } catch (error) {
    console.error("Error with permanent fix for NFS West instructor images:", error);
    throw error;
  }
}