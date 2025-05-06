import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function addStaffCounselingTable() {
  console.log("Adding staff counseling table...");
  
  try {
    // Check if staff_counseling table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'staff_counseling'
      );
    `);
    
    // If the table doesn't exist, create it
    if (!tableExists.rows[0].exists) {
      console.log('Creating staff_counseling table...');
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS staff_counseling (
          id SERIAL PRIMARY KEY,
          school_id INTEGER NOT NULL REFERENCES schools(id),
          instructor_id INTEGER NOT NULL REFERENCES instructors(id),
          counseling_type TEXT NOT NULL,
          counseling_date DATE NOT NULL,
          comments TEXT,
          attachment_url TEXT,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP
        );
      `);
      
      console.log('Staff counseling table created successfully!');
      
      // Add a system_settings record to track that we've created the table
      const settingsExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = 'system_settings'
        );
      `);

      if (settingsExists.rows[0].exists) {
        await db.execute(sql`
          INSERT INTO system_settings (key, value)
          VALUES ('staff_counseling_table_created', 'true')
          ON CONFLICT (key) DO UPDATE SET value = 'true';
        `);
      }
      
      return true;
    } else {
      console.log('Staff counseling table already exists.');
      return true;
    }
  } catch (error) {
    console.error('Error creating staff_counseling table:', error);
    return false;
  }
}
