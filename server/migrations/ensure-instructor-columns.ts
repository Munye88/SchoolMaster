import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function ensureInstructorColumns() {
  try {
    console.log('🔧 Ensuring all instructor columns exist...');
    
    // Add all instructor columns with proper defaults
    await db.execute(sql`
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS email text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS date_of_birth date;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS passport_number text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_contact text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_phone text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS contract_end_date date;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS salary integer;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS department text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS notes text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_contact_name text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS employment_status text DEFAULT 'active';
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS hire_date date;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT NOW();
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT NOW();
    `);

    // Update existing records with proper defaults
    await db.execute(sql`
      UPDATE instructors SET status = 'Active' WHERE status IS NULL;
      UPDATE instructors SET employment_status = 'active' WHERE employment_status IS NULL;
      UPDATE instructors SET created_at = NOW() WHERE created_at IS NULL;
      UPDATE instructors SET updated_at = NOW() WHERE updated_at IS NULL;
    `);

    console.log('✅ All instructor columns ensured with proper defaults');
  } catch (error) {
    console.error('❌ Error ensuring instructor columns:', error);
    throw error;
  }
}