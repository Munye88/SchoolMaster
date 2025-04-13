import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// NFS West instructor data - exactly 27 male instructors
const nfsWestInstructors = [
  {
    name: "Ahmed Al-Farsi",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-07-03",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3001",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Mohammad Al-Hakim",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-06-05",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3002",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Jamal Ibrahim",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2021-08-12",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3003",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Hassan Al-Zahrani",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-01-15",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3004",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Khalid Al-Otaibi",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-03-20",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3005",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Ali Al-Shammari",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-05-10",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3006",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Omar Al-Saud",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-11-05",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3007",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Abdullah Al-Qahtani",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-09-18",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3008",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Faisal Al-Ghamdi",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-07-22",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3009",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Saad Al-Maliki",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-01-08",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3010",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Tariq Al-Harbi",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-04-15",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3011",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Yusuf Al-Sulaiman",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-10-12",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3012",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Ibrahim Al-Dawsari",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-08-03",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3013",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Majid Al-Doussari",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-05-27",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3014",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Nasir Al-Juhani",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-02-14",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3015",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Waleed Al-Rashidi",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-07-19",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3016",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Hamza Al-Anazi",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-12-08",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3017",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Sami Al-Khaldi",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-10-25",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3018",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Fahad Al-Mutairi",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-09-11",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3019",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Talal Al-Dhafiri",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-04-07",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3020",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Zaid Al-Shammari",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-06-14",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3021",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Rakan Al-Dosari",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-08-26",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3022",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Naif Al-Qurashi",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-11-09",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3023",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Bassam Al-Zaidi",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-05-18",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3024",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Badr Al-Ruwaili",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-07-30",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3025",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Mubarak Al-Enezi",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-02-21",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-3026",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Saleh Al-Assaf",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-06-01",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-3027",
    accompaniedStatus: "Unaccompanied"
  }
];

export async function updateNfsWestInstructors() {
  try {
    console.log("Updating NFS West instructors...");
    
    // Get all current instructors for NFS West (school ID 351)
    const currentInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 351)
    });
    
    console.log(`Found ${currentInstructors.length} existing NFS West instructors`);
    
    // Update each instructor in order
    for (let i = 0; i < Math.min(currentInstructors.length, nfsWestInstructors.length); i++) {
      const current = currentInstructors[i];
      const newData = nfsWestInstructors[i];
      
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
    
    // If we need to add more instructors
    if (currentInstructors.length < nfsWestInstructors.length) {
      const newCount = nfsWestInstructors.length - currentInstructors.length;
      console.log(`Adding ${newCount} new NFS West instructors`);
      
      for (let i = currentInstructors.length; i < nfsWestInstructors.length; i++) {
        const newData = nfsWestInstructors[i];
        
        // Insert new instructor
        const result = await db
          .insert(instructors)
          .values({
            name: newData.name,
            schoolId: 351, // NFS West school ID
            nationality: newData.nationality,
            credentials: newData.credentials,
            startDate: new Date(newData.startDate),
            compound: newData.compound,
            phone: newData.phone,
            accompaniedStatus: newData.accompaniedStatus,
            imageUrl: null, // We'll update images in a separate function
            role: newData.position
          })
          .returning();
        
        console.log(`Added new instructor ${result[0].id} for ${newData.name}`);
      }
    }
    
    console.log("NFS West instructors updated successfully");
  } catch (error) {
    console.error("Error updating NFS West instructors:", error);
    throw error;
  }
}