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
    
    // Insert required schools if they don't exist (using INSERT ON CONFLICT)
    console.log('🏫 Ensuring required schools exist...');
    
    const requiredSchools = [
      { id: 349, name: 'KFNA', code: 'KFNA', location: 'King Fahd Naval Academy' },
      { id: 350, name: 'NFS East', code: 'NFS_EAST', location: 'Naval Flight School East' },
      { id: 351, name: 'NFS West', code: 'NFS_WEST', location: 'Naval Flight School West' }
    ];
    
    for (const school of requiredSchools) {
      await db.execute(sql`
        INSERT INTO schools (id, name, code, location, created_at)
        VALUES (${school.id}, ${school.name}, ${school.code}, ${school.location}, NOW())
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          location = EXCLUDED.location;
      `);
      console.log(`✅ Ensured school exists: ${school.name} (ID: ${school.id})`);
    }
    
    // Update sequence to prevent ID conflicts
    console.log('🔢 Updating schools ID sequence...');
    await db.execute(sql`
      SELECT setval('schools_id_seq', GREATEST(351, (SELECT MAX(id) FROM schools)));
    `);
    
    // Verify all required schools exist
    const finalSchools = await db.execute(sql`
      SELECT id, name, code FROM schools WHERE id IN (349, 350, 351);
    `);
    
    if (finalSchools.rows.length === 3) {
      console.log('✅ PRODUCTION SCHEMA FIX COMPLETE: All required schools verified');
      return true;
    } else {
      console.error('❌ PRODUCTION SCHEMA FIX FAILED: Missing required schools');
      return false;
    }
    
  } catch (error) {
    console.error('🚨 CRITICAL: Production schema fix failed:', error);
    return false;
  }
}