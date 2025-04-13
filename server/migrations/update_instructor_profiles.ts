import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq, not, and } from "drizzle-orm";

export async function updateInstructorProfiles() {
  try {
    console.log("Updating instructor profiles with images...");
    
    // Define the 17 instructors we want to keep (from the NFS East instructor profiles)
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

    // Delete any instructors for NFS East that aren't in our list
    const allNfsEastInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 350)
    });
    
    for (const instructor of allNfsEastInstructors) {
      if (!nfsEastInstructorNames.includes(instructor.name)) {
        await db.delete(instructors).where(eq(instructors.id, instructor.id));
        console.log(`Deleted instructor not in our list: ${instructor.name}`);
      }
    }
    
    // Update instructor images
    const baseImageUrl = "/instructor_images/default_instructor.jpg";
    
    for (const instructorName of nfsEastInstructorNames) {
      // Update the instructor with image URL
      await db
        .update(instructors)
        .set({
          imageUrl: baseImageUrl,
          role: "ELT Instructor" // Ensure all have the correct role
        })
        .where(
          and(
            eq(instructors.name, instructorName),
            eq(instructors.schoolId, 350)
          )
        );
      
      console.log(`Updated instructor ${instructorName} with image`);
    }
    
    console.log("Instructor profiles updated successfully");
  } catch (error) {
    console.error("Error updating instructor profiles:", error);
    throw error;
  }
}
