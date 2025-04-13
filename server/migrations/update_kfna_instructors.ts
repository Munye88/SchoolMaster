import { db } from "../db";
import { instructors } from "../../shared/schema";
import { eq } from "drizzle-orm";

// KFNA instructor data - exactly 20 male instructors
const kfnaInstructors = [
  {
    name: "John Smith",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-07-03",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2001",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Michael Johnson",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2021-06-05",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2002",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "David Williams",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-08-12",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2003",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "James Brown",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2022-01-15",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2004",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Robert Jones",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-03-20",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2005",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "William Garcia",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-05-10",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2006",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Richard Miller",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-11-05",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2007",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Thomas Davis",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-09-18",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2008",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Charles Rodriguez",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-07-22",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2009",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Daniel Martinez",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-01-08",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2010",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Matthew Hernandez",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-04-15",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2011",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Anthony Lopez",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-10-12",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2012",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Donald Gonzalez",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-08-03",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2013",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Steven Wilson",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-05-27",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2014",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Paul Anderson",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-02-14",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2015",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Kenneth Taylor",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-07-19",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2016",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Edward Thomas",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-12-08",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2017",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Jason Moore",
    position: "ELT Instructor",
    nationality: "American",
    startDate: "2022-10-25",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2018",
    accompaniedStatus: "Accompanied"
  },
  {
    name: "Brian Jackson",
    position: "ELT Instructor",
    nationality: "British",
    startDate: "2021-09-11",
    credentials: "ELT Certification",
    compound: "Saken",
    phone: "555-2019",
    accompaniedStatus: "Unaccompanied"
  },
  {
    name: "Kevin Martin",
    position: "ELT Instructor",
    nationality: "Canadian",
    startDate: "2023-04-07",
    credentials: "ELT Certification",
    compound: "Al Reem",
    phone: "555-2020",
    accompaniedStatus: "Accompanied"
  }
];

export async function updateKfnaInstructors() {
  try {
    console.log("Updating KFNA instructors...");
    
    // Get all current instructors for KFNA (school ID 349)
    const currentInstructors = await db.query.instructors.findMany({
      where: eq(instructors.schoolId, 349)
    });
    
    // If we have more instructors than needed, delete the excess ones
    if (currentInstructors.length > kfnaInstructors.length) {
      const excessCount = currentInstructors.length - kfnaInstructors.length;
      console.log(`Removing ${excessCount} excess KFNA instructors`);
      
      for (let i = kfnaInstructors.length; i < currentInstructors.length; i++) {
        await db
          .delete(instructors)
          .where(eq(instructors.id, currentInstructors[i].id));
          
        console.log(`Deleted excess instructor with ID ${currentInstructors[i].id}`);
      }
      
      // Re-fetch the current instructors after deletion
      const updatedInstructors = await db.query.instructors.findMany({
        where: eq(instructors.schoolId, 349)
      });
      
      currentInstructors.length = updatedInstructors.length;
    }
    
    // Update each instructor in order
    for (let i = 0; i < Math.min(currentInstructors.length, kfnaInstructors.length); i++) {
      const current = currentInstructors[i];
      const newData = kfnaInstructors[i];
      
      // Update the instructor with new data
      await db
        .update(instructors)
        .set({
          name: newData.name,
          nationality: newData.nationality,
          credentials: newData.credentials,
          startDate: newData.startDate,
          compound: newData.compound,
          phone: newData.phone,
          accompaniedStatus: newData.accompaniedStatus,
          role: newData.position
        })
        .where(eq(instructors.id, current.id));
      
      console.log(`Updated instructor ${current.id} with new data for ${newData.name}`);
    }
    
    // If we need to add more instructors
    if (currentInstructors.length < kfnaInstructors.length) {
      for (let i = currentInstructors.length; i < kfnaInstructors.length; i++) {
        const newData = kfnaInstructors[i];
        
        // Insert new instructor
        const result = await db
          .insert(instructors)
          .values({
            name: newData.name,
            schoolId: 349, // KFNA school ID
            nationality: newData.nationality,
            credentials: newData.credentials,
            startDate: newData.startDate,
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
    
    console.log("KFNA instructors updated successfully");
  } catch (error) {
    console.error("Error updating KFNA instructors:", error);
    throw error;
  }
}