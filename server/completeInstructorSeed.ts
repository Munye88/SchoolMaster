import { storage } from "./storage";

interface InstructorSeedData {
  name: string;
  nationality: string;
  credentials: string;
  startDate: string;
  compound: string;
  schoolId: number;
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
    schoolId: 349,
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
    schoolId: 349,
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
    schoolId: 350,
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
    schoolId: 350,
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
    schoolId: 350,
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
    schoolId: 350,
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
    schoolId: 350,
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
    schoolId: 350,
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
    schoolId: 350,
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
    schoolId: 350,
    phone: "055-025-3265",
    accompaniedStatus: "Accompanied",
    role: "ELT Instructor"
  },
  {
    name: "Afrim Trelak",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2022-01-01",
    compound: "Al Reem",
    schoolId: 350,
    phone: "555-1250",
    accompaniedStatus: "Accompanied",
    role: "ELT Instructor"
  },
  {
    name: "Paul Moss",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2022-01-01",
    compound: "Al Reem",
    schoolId: 350,
    phone: "055-025-3275",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Dahir Adani",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolId: 350,
    phone: "055-024-9883",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Vacant",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2022-01-01",
    compound: "Al Reem",
    schoolId: 350,
    phone: "555-1243",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Muhidin Sheikh",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolId: 350,
    phone: "055-025-3391",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Said Ibrahim",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2022-06-23",
    compound: "Al Reem",
    schoolId: 350,
    phone: "050-631-0781",
    accompaniedStatus: "Accompanied",
    role: "ELT Instructor"
  },
  {
    name: "Abdulaziz Yusuf",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2022-06-30",
    compound: "Al Reem",
    schoolId: 350,
    phone: "056-408-9608",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Rafiq Abdul-Alim",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2023-04-16",
    compound: "Al Reem",
    schoolId: 350,
    phone: "056-589-1338",
    accompaniedStatus: "Unaccompanied",
    role: "SR ELT Instructor"
  },
  {
    name: "Omar Obsiye",
    nationality: "British",
    credentials: "ELT Certification",
    startDate: "2022-07-03",
    compound: "Al Reem",
    schoolId: 350,
    phone: "054-404-3319",
    accompaniedStatus: "Unaccompanied",
    role: "ELT Instructor"
  },
  {
    name: "Tarik Preston",
    nationality: "American",
    credentials: "ELT Certification",
    startDate: "2021-06-01",
    compound: "Al Reem",
    schoolId: 350,
    phone: "055-025-3417",
    accompaniedStatus: "Accompanied",
    role: "SR ELT Instructor"
  }
];

export async function seedCompleteInstructors() {
  try {
    console.log("Starting instructor database seeding with complete data...");
    
    // Check if instructors already exist
    const existingInstructors = await storage.getInstructors();
    
    if (existingInstructors && existingInstructors.length > 0) {
      console.log(`Instructors already exist (${existingInstructors.length} found), skipping complete seed`);
      return;
    }
    
    let createdCount = 0;
    
    for (const instructorData of instructorsData) {
      try {
        await storage.createInstructor({
          name: instructorData.name,
          nationality: instructorData.nationality,
          credentials: instructorData.credentials,
          startDate: instructorData.startDate,
          compound: instructorData.compound,
          schoolId: instructorData.schoolId,
          phone: instructorData.phone,
          accompaniedStatus: instructorData.accompaniedStatus,
          imageUrl: null,
          role: instructorData.role
        });
        createdCount++;
      } catch (error) {
        console.error(`Failed to create instructor ${instructorData.name}:`, error);
      }
    }
    
    console.log(`Successfully seeded ${createdCount} instructors from complete database export`);
    
  } catch (error) {
    console.error("Error seeding complete instructor data:", error);
  }
}