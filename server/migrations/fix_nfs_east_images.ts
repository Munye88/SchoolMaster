import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

// The list of NFS East instructors in the correct order as they should appear
const nfsEastInstructorNames = [
  "Omar Obsiye",
  "Abdibasid Barre",
  "Muhidin Sheikh",
  "Aaron N'diaye",
  "Rafiq Abdul-Alim",
  "Abdulaziz Yusuf",
  "Shamell Hurd",
  "Jose Montalvo",
  "Shah Nawaz",
  "Abukar Bashir",
  "Paul Moss",
  "Matthew Drake",
  "Dahir Adani",
  "Mohamed Mohamed",
  "Said Ibrahim",
  "Musab Ahmed",
  "Afrim Trelak"
];

// Function to fix NFS East instructor image mismatches
export async function fixNfsEastImages() {
  try {
    console.log("Starting to fix NFS East instructor image associations...");
    
    // Get all current instructors for NFS East (school ID 350)
    const currentInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 350)
    });
    
    console.log(`Found ${currentInstructors.length} NFS East instructors`);
    
    // Step 1: Store all image URLs temporarily
    const imageUrls: (string | null)[] = [];
    for (const instructor of currentInstructors) {
      imageUrls.push(instructor.imageUrl);
    }
    
    console.log("Stored all image URLs temporarily");
    
    // Step 2: First, clear all image URLs to avoid conflicts
    for (const instructor of currentInstructors) {
      await db
        .update(instructors)
        .set({ imageUrl: null })
        .where(eq(instructors.id, instructor.id));
    }
    
    console.log("Cleared all image URLs temporarily");
    
    // Step 3: Reassign images based on the correct order
    // Match images with instructors based on their position in the list
    for (let i = 0; i < Math.min(currentInstructors.length, nfsEastInstructorNames.length); i++) {
      const instructorName = nfsEastInstructorNames[i];
      const instructor = currentInstructors.find(instr => instr.name === instructorName);
      
      if (instructor) {
        const imageIndex = i % imageUrls.length; // Ensure we don't go out of bounds
        const imageUrl = imageUrls[imageIndex];
        
        await db
          .update(instructors)
          .set({ imageUrl })
          .where(eq(instructors.id, instructor.id));
        
        console.log(`Re-assigned image for ${instructorName} (ID: ${instructor.id})`);
      } else {
        console.log(`WARNING: Could not find instructor with name ${instructorName}`);
      }
    }
    
    console.log("NFS East instructor image associations fixed successfully");
  } catch (error) {
    console.error("Error fixing NFS East instructor images:", error);
    throw error;
  }
}