import { db } from './db';
import { sql } from 'drizzle-orm';

export async function fixProductionSchema() {
  try {
    console.log('🔧 PRODUCTION SCHEMA FIX: Starting comprehensive database repair...');
    
    // First, check if schools table exists and has correct structure
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schools'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('📚 Creating schools table from scratch...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS schools (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(50) UNIQUE NOT NULL,
          location VARCHAR(255)
        );
      `);
    }
    
    // Check for created_at column and add if missing
    const hasCreatedAt = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'schools' 
        AND column_name = 'created_at'
      );
    `);
    
    if (!hasCreatedAt.rows[0].exists) {
      console.log('📅 Adding created_at column to schools table...');
      await db.execute(sql`
        ALTER TABLE schools ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
      `);
    }
    
    // Clean up duplicate school codes by keeping only the first occurrence of each
    console.log('🧹 Cleaning duplicate school codes...');
    await db.execute(sql`
      DELETE FROM schools s1
      USING schools s2
      WHERE s1.id > s2.id
      AND s1.code = s2.code;
    `);
    
    // CRITICAL: Clear any existing test scores with invalid foreign keys
    console.log('🗑️ Clearing invalid test scores before schema fix...');
    await db.execute(sql`
      DELETE FROM test_scores WHERE school_id NOT IN (
        SELECT id FROM schools WHERE id IN (349, 350, 351)
      );
    `);
    
    // Insert required schools if they don't exist (using INSERT ON CONFLICT)
    console.log('🏫 Ensuring required schools exist...');
    
    const requiredSchools = [
      { id: 349, name: 'KFNA', code: 'KFNA', location: 'King Fahd Naval Academy' },
      { id: 350, name: 'NFS East', code: 'NFS_EAST', location: 'Naval Flight School East' },
      { id: 351, name: 'NFS West', code: 'NFS_WEST', location: 'Naval Flight School West' }
    ];
    
    for (const school of requiredSchools) {
      // First check if school exists with this ID
      const existingById = await db.execute(sql`
        SELECT id FROM schools WHERE id = ${school.id};
      `);
      
      // Check if school exists with this code
      const existingByCode = await db.execute(sql`
        SELECT id FROM schools WHERE code = ${school.code};
      `);
      
      if (existingById.rows.length === 0) {
        if (existingByCode.rows.length > 0) {
          // Update existing school with correct ID
          await db.execute(sql`
            UPDATE schools SET id = ${school.id}, name = ${school.name}, location = ${school.location}
            WHERE code = ${school.code};
          `);
          console.log(`🔄 Updated existing school: ${school.name} (ID: ${school.id})`);
        } else {
          // Insert new school
          await db.execute(sql`
            INSERT INTO schools (id, name, code, location, created_at)
            VALUES (${school.id}, ${school.name}, ${school.code}, ${school.location}, NOW());
          `);
          console.log(`➕ Created new school: ${school.name} (ID: ${school.id})`);
        }
      } else {
        console.log(`✅ School already exists: ${school.name} (ID: ${school.id})`);
      }
    }
    
    // Update sequence to prevent ID conflicts
    console.log('🔢 Updating schools ID sequence...');
    await db.execute(sql`
      SELECT setval('schools_id_seq', GREATEST(351, (SELECT MAX(id) FROM schools)));
    `);
    
    // CRITICAL: Create test_scores table if missing (this is why uploads fail on production)  
    console.log('📊 Ensuring test_scores table exists for upload functionality...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS test_scores (
        id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        school_id INTEGER NOT NULL REFERENCES schools(id),
        test_type VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        test_date TIMESTAMP NOT NULL,
        instructor VARCHAR(255) NOT NULL,
        course VARCHAR(255) NOT NULL,
        level VARCHAR(100) NOT NULL,
        upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_test_scores_school_id ON test_scores(school_id);
      CREATE INDEX IF NOT EXISTS idx_test_scores_test_type ON test_scores(test_type);
      CREATE INDEX IF NOT EXISTS idx_test_scores_test_date ON test_scores(test_date);
    `);
    
    console.log('✅ Test scores table created/verified for upload functionality');
    
    // Verify all required schools exist
    const finalSchools = await db.execute(sql`
      SELECT id, name, code FROM schools WHERE id IN (349, 350, 351);
    `);
    
    // Verify test_scores table exists
    const testScoresExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'test_scores'
      );
    `);
    
    if (finalSchools.rows.length === 3 && testScoresExists.rows[0].exists) {
      console.log('✅ PRODUCTION SCHEMA FIX COMPLETE: All required tables and schools verified');
      console.log('🎯 Upload functionality now available on production');
      return true;
    } else {
      console.error('❌ PRODUCTION SCHEMA FIX FAILED: Missing required components');
      return false;
    }
    
  } catch (error) {
    console.error('🚨 CRITICAL: Production schema fix failed:', error);
    return false;
  }
}