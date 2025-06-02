import { db } from "./db";
import { instructors, schools } from "@shared/schema";
import { eq } from "drizzle-orm";

interface InstructorSeedData {
  name: string;
  nationality: string;
  credentials: string;
  startDate: string;
  compound: string;
  schoolCode: string; // Changed from schoolId to schoolCode
  phone: string;
  accompaniedStatus: string;
  role: string;
}

const instructorsData: InstructorSeedData[] = [
  {
    name: "Michael Migliore",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolCode: "KFNA",
    phone: "555-2020",
    accompaniedStatus: "Accompanied",
    role: "SR ELT Instructor"
  },
  {
    name: "Anthony Migliore",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolCode: "KFNA",
    phone: "555-2019",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Matthew Drake",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2024-02-19",
    compound: "Saken",
    schoolCode: "NFS_EAST",
    phone: "050-700-4786",
    accompaniedStatus: "Accompanied",
    role: "ELT Instructor"
  },
  {
    name: "Shah Nawaz",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2021-07-15",
    compound: "Saken",
    schoolCode: "NFS_EAST",
    phone: "050-633-2469",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Mohamed Mohamed",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolCode: "NFS_EAST",
    phone: "055-025-2436",
    accompaniedStatus: "Accompanied",
    role: "ELT Instructor"
  },
  {
    name: "Shamell Hurd",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2023-04-16",
    compound: "Al Reem",
    schoolCode: "NFS_EAST",
    phone: "055-025-3278",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Vacant",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2022-07-03",
    compound: "Al Reem",
    schoolCode: "NFS_EAST",
    phone: "555-1234",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Abdibasid Barre",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolCode: "NFS_EAST",
    phone: "055-025-3581",
    accompaniedStatus: "Accompanied",
    role: "ELT Instructor"
  },
  {
    name: "Jose Montalvo",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2024-06-13",
    compound: "Al Reem",
    schoolCode: "NFS_EAST",
    phone: "050-966-1203",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Musab Ahmed",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolCode: "NFS_EAST",
    phone: "055-025-3265",
    accompaniedStatus: "Accompanied",
    role: "ELT Instructor"
  }
];

export async function seedCompleteInstructors() {
  try {
    console.log("👨‍🏫 Starting instructor database seeding with complete data...");
    
    // Check if instructors already exist
    const existingInstructors = await db.select().from(instructors);
    
    if (existingInstructors && existingInstructors.length > 0) {
      console.log(`✅ Instructors already exist (${existingInstructors.length} found), skipping complete seed`);
      return;
    }
    
    // Get all schools to map codes to IDs
    const allSchools = await db.select().from(schools);
    const schoolMap = new Map();
    allSchools.forEach(school => {
      schoolMap.set(school.code, school.id);
    });
    
    console.log(`📍 Found ${allSchools.length} schools for mapping:`, Array.from(schoolMap.entries()));
    
    let createdCount = 0;
    
    for (const instructorData of instructorsData) {
      try {
        const schoolId = schoolMap.get(instructorData.schoolCode);
        
        if (!schoolId) {
          console.error(`❌ School not found for code: ${instructorData.schoolCode}`);
          continue;
        }
        
        const [instructor] = await db.insert(instructors).values({
          name: instructorData.name,
          nationality: instructorData.nationality,
          credentials: instructorData.credentials,
          startDate: instructorData.startDate,
          compound: instructorData.compound,
          schoolId: schoolId,
          phone: instructorData.phone,
          accompaniedStatus: instructorData.accompaniedStatus,
          imageUrl: null,
          role: instructorData.role
        }).returning();
        
        console.log(`✅ Created instructor: ${instructor.name} (School: ${instructorData.schoolCode})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create instructor ${instructorData.name}:`, error);
      }
    }
    
    console.log(`✅ Successfully seeded ${createdCount} instructors from complete database export`);
    
  } catch (error) {
    console.error("❌ Error seeding complete instructor data:", error);
  }
}