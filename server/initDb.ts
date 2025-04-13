import { db } from './db';
import { staffAttendance } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { addColumnsToStaffLeave } from './migrations/add_columns_to_staff_leave';
import { updateNfsEastInstructors } from './migrations/update_nfs_east_instructors';
import { updateNfsEastImages } from './migrations/update_nfs_east_images';

export async function initDatabase() {
  try {
    // Check if staff_attendance table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'staff_attendance'
      );
    `);
    
    // If the table doesn't exist, create it
    if (!tableExists.rows[0].exists) {
      console.log('Creating staff_attendance table...');
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS staff_attendance (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          instructor_id INTEGER NOT NULL REFERENCES instructors(id),
          status TEXT NOT NULL,
          time_in TEXT,
          time_out TEXT,
          comments TEXT,
          recorded_by INTEGER REFERENCES users(id)
        );
      `);
      
      console.log('staff_attendance table created successfully!');
    } else {
      console.log('staff_attendance table already exists.');
    }
    
    // Run the staff leave table migration
    await addColumnsToStaffLeave();
    
    // Update NFS East instructors
    await updateNfsEastInstructors();
    
    // Update NFS East instructor images
    await updateNfsEastImages();
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}