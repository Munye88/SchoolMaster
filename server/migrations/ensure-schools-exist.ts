import { db } from '../db';
import { schools } from '@shared/schema';
import { sql } from 'drizzle-orm';

interface RequiredSchool {
  id: number;
  name: string;
  code: string;
  location: string;
}

const requiredSchools: RequiredSchool[] = [
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

export async function ensureSchoolsExist() {
  try {
    console.log("🏫 CRITICAL: Ensuring all required schools exist for test scores...");
    
    // Get all existing schools
    const existingSchools = await db.select().from(schools);
    const existingIds = existingSchools.map(s => s.id);
    
    console.log(`📚 Found existing school IDs: [${existingIds.join(', ')}]`);
    
    let createdCount = 0;
    
    for (const requiredSchool of requiredSchools) {
      if (!existingIds.includes(requiredSchool.id)) {
        try {
          console.log(`🆕 Creating missing school: ${requiredSchool.name} (ID: ${requiredSchool.id})`);
          
          // Use INSERT ... ON CONFLICT DO NOTHING to safely create schools
          await db.execute(sql`
            INSERT INTO schools (id, name, code, location, created_at, updated_at)
            VALUES (${requiredSchool.id}, ${requiredSchool.name}, ${requiredSchool.code}, ${requiredSchool.location}, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `);
          
          console.log(`✅ Successfully created school: ${requiredSchool.name} (ID: ${requiredSchool.id})`);
          createdCount++;
        } catch (error) {
          console.error(`❌ Failed to create school ${requiredSchool.name}:`, error);
          
          // Try alternative approach - check if it's a sequence issue
          try {
            console.log(`🔄 Attempting to update sequence for school ID ${requiredSchool.id}...`);
            await db.execute(sql`
              SELECT setval('schools_id_seq', ${requiredSchool.id}, false)
            `);
            
            // Try insert again
            const [school] = await db.insert(schools).values({
              id: requiredSchool.id,
              name: requiredSchool.name,
              code: requiredSchool.code,
              location: requiredSchool.location
            }).returning();
            
            console.log(`✅ Successfully created school via sequence fix: ${school.name} (ID: ${school.id})`);
            createdCount++;
          } catch (secondError) {
            console.error(`❌ Failed to create school even with sequence fix:`, secondError);
          }
        }
      } else {
        console.log(`✅ School ${requiredSchool.name} (ID: ${requiredSchool.id}) already exists`);
      }
    }
    
    // Verify all required schools now exist
    const finalSchools = await db.select().from(schools);
    const finalIds = finalSchools.map(s => s.id);
    const missingIds = requiredSchools.map(s => s.id).filter(id => !finalIds.includes(id));
    
    if (missingIds.length === 0) {
      console.log(`✅ All required schools verified: [${requiredSchools.map(s => s.id).join(', ')}]`);
      console.log(`📊 Created ${createdCount} new schools for production deployment`);
    } else {
      console.error(`❌ Still missing schools with IDs: [${missingIds.join(', ')}]`);
      throw new Error(`Critical: Required schools still missing: ${missingIds.join(', ')}`);
    }
    
  } catch (error) {
    console.error("❌ Critical error ensuring schools exist:", error);
    throw error;
  }
}