import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Function to update instructor image URLs for KFNA
export async function updateKfnaImages() {
  try {
    console.log("Updating KFNA instructor images...");
    
    // Get all KFNA instructors (schoolId 349)
    const kfnaInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 349)
    });
    
    // Base URL for default profile images
    const baseImageUrl = "/default-profile-images";
    
    // Update each instructor with a standard image URL format
    for (const instructor of kfnaInstructors) {
      // Get initials for fallback (first 2 letters of first and last name)
      const initials = instructor.name
        .split(' ')
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
      
      // Create a deterministic but unique color based on instructor's id
      const colorIndex = instructor.id % 5;
      const colorClass = ["blue", "green", "purple", "amber", "pink"][colorIndex];
      
      // Update the instructor with image URL and fallback info
      await db
        .update(instructors)
        .set({
          imageUrl: null // Reset any existing URL so we start fresh with initials
        })
        .where(eq(instructors.id, instructor.id));
      
      console.log(`Updated image for instructor ${instructor.id} (${instructor.name})`);
    }
    
    console.log("KFNA instructor images updated successfully");
  } catch (error) {
    console.error("Error updating KFNA instructor images:", error);
    throw error;
  }
}