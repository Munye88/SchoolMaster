import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Instructor data from the document
const nfsEastInstructors = [
  {
    name: "Omar Obsiye",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-07-03",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1234",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Abdibasid Barre",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1235",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Muhidin Sheikh",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2021-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1236",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Aaron N'diaye",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2021-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1237",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Rafiq Abdul-Alim",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2023-08-02",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1238",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Abdulaziz Yusuf",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1239",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Shamell Hurd",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2023-04-16",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1240",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Jose Montalvo",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-01-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1241",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Shah Nawaz",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-01-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1242",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Abukar Bashir",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-01-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1243",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Paul Moss",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2021-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1244",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Matthew Drake",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-01-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1245",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Dahir Adani",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1246",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Mohamed Mohamed",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2021-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1247",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Said Ibrahim",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-01-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1248",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Musab Ahmed",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1249",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Afrim Trelak",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-01-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-1250",
    accompaniedStatus: "Accompanied"
  }
];

export async function updateNfsEastInstructors() {
  try {
    console.log("Updating NFS East instructors...");
    
    // Get all current instructors for NFS East (school ID 350)
    const currentInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 350)
    });
    
    // Update each instructor in order
    for (let i = 0; i < Math.min(currentInstructors.length, nfsEastInstructors.length); i++) {
      const current = currentInstructors[i];
      const newData = nfsEastInstructors[i];
      
      // Update the instructor with new data
      await db
        .update(instructors)
        .set({
          name: newData.name,
          nationality: newData.nationality,
          credentials: newData.credentials,
          startDate: new Date(newData.startDate),
          compound: newData.compound,
          phone: newData.phone,
          accompaniedStatus: newData.accompaniedStatus,
          role: newData.position
        })
        .where(eq(instructors.id, current.id));
      
      console.log(`Updated instructor ${current.id} with new data for ${newData.name}`);
    }
    
    console.log("NFS East instructors updated successfully");
  } catch (error) {
    console.error("Error updating NFS East instructors:", error);
    throw error;
  }
}
