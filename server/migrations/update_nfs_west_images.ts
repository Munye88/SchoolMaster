import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Function to update instructor image URLs for NFS West
export async function updateNfsWestImages() {
  try {
    console.log("Updating NFS West instructor images...");
    
    // Get all NFS West instructors (schoolId 351)
    const nfsWestInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 351)
    });
    
    // Base URL for default profile images
    const baseImageUrl = "/default-profile-images";
    
    // Update each instructor with a standard image URL format
    for (const instructor of nfsWestInstructors) {
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
      
      // Only update instructors that don't already have an image
      const existingImage = instructor.imageUrl;
      if (!existingImage) {
        await db
          .update(instructors)
          .set({
            imageUrl: null // Only set to null if no image exists
          })
          .where(eq(instructors.id, instructor.id));
      } else {
        console.log(`Preserving existing image for instructor ${instructor.id} (${instructor.name})`);
      }
      
      console.log(`Updated image for instructor ${instructor.id} (${instructor.name})`);
    }
    
    console.log("NFS West instructor images updated successfully");
  } catch (error) {
    console.error("Error updating NFS West instructor images:", error);
    throw error;
  }
}