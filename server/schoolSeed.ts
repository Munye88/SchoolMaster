import { storage } from "./storage";

interface SchoolSeedData {
  id: number;
  name: string;
  code: string;
  location: string;
}

const schoolsData: SchoolSeedData[] = [
  {
    id: 349,
    name: "KFNA",
    code: "KFNA",
    location: "King Faisal Naval Academy"
  },
  {
    id: 350,
    name: "NFS East",
    code: "NFS_EAST",
    location: "Eastern Province"
  },
  {
    id: 351,
    name: "NFS West",
    code: "NFS_WEST",
    location: "Western Province"
  }
];

export async function seedSchools() {
  try {
    console.log("Starting schools seeding...");
    
    // Check if schools already exist
    const existingSchools = await storage.getSchools();
    
    if (existingSchools && existingSchools.length > 0) {
      console.log(`Schools already exist (${existingSchools.length} found), skipping seed`);
      return;
    }
    
    let createdCount = 0;
    
    for (const schoolData of schoolsData) {
      try {
        await storage.createSchool({
          name: schoolData.name,
          code: schoolData.code,
          location: schoolData.location
        });
        createdCount++;
      } catch (error) {
        console.error(`Failed to create school ${schoolData.name}:`, error);
      }
    }
    
    console.log(`Successfully seeded ${createdCount} schools`);
    
  } catch (error) {
    console.error("Error seeding schools:", error);
  }
}