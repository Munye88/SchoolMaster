import { db } from "../db";
import { instructors, evaluations, courses, staffAttendance, staffLeave } from "../../shared/schema";
import { eq, not, and, inArray } from "drizzle-orm";

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

    // Get all instructors for NFS East
    const allNfsEastInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 350)
    });
    
    // Collect IDs of instructors to keep and those to mark as inactive
    const keepInstructorIds = [];
    const instructorsNotInList = [];
    
    for (const instructor of allNfsEastInstructors) {
      if (nfsEastInstructorNames.includes(instructor.name.trim())) {
        keepInstructorIds.push(instructor.id);
      } else {
        instructorsNotInList.push(instructor);
      }
    }
    
    // Instead of deleting, we'll update instructors not in our list to have a special role
    // This preserves foreign key relationships while effectively hiding them from the UI
    for (const instructor of instructorsNotInList) {
      await db
        .update(instructors)
        .set({
          role: "ARCHIVED", // Mark as archived instead of deleting
          imageUrl: null // Remove any image
        })
        .where(eq(instructors.id, instructor.id));
      
      console.log(`Marked instructor as archived: ${instructor.name}`);
    }
    
    // Update instructor images and roles for the ones we want to keep
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
            eq(instructors.schoolId, 350),
            eq(instructors.name, instructorName)
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
