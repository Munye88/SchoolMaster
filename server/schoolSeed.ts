import { db } from "./db";
import { schools } from "@shared/schema";

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
    console.log("🏫 Starting schools seeding...");
    
    // Check if the required school IDs exist
    const requiredIds = [349, 350, 351];
    const existingSchools = await db.select().from(schools);
    const existingIds = existingSchools.map(s => s.id);
    const missingIds = requiredIds.filter(id => !existingIds.includes(id));
    
    if (missingIds.length === 0) {
      console.log(`✅ All required schools exist, skipping seed`);
      return;
    }
    
    console.log(`Creating schools with IDs: ${missingIds.join(', ')}`);
    
    let createdCount = 0;
    
    for (const schoolData of schoolsData) {
      if (missingIds.includes(schoolData.id)) {
        try {
          // Insert with specific ID by including it in the values
          const [school] = await db.insert(schools).values({
            id: schoolData.id,
            name: schoolData.name,
            code: schoolData.code,
            location: schoolData.location
          }).returning();
          console.log(`✅ Created school: ${school.name} (ID: ${school.id})`);
          createdCount++;
        } catch (error) {
          console.error(`❌ Failed to create school ${schoolData.name} with ID ${schoolData.id}:`, error);
        }
      }
    }
    
    console.log(`✅ Successfully seeded ${createdCount} schools`);
    
  } catch (error) {
    console.error("❌ Error seeding schools:", error);
  }
}