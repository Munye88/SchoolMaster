import { db } from './db';
import { staffAttendance } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { addColumnsToStaffLeave } from './migrations/add_columns_to_staff_leave';
import { updateNfsEastInstructors } from './migrations/update_nfs_east_instructors';
import { updateNfsEastImages } from './migrations/update_nfs_east_images';
import { fixNfsEastImages } from './migrations/fix_nfs_east_images';
import { permanentFixNfsEastImages } from './migrations/permanent_fix_nfs_east_images';
import { updateKfnaInstructors } from './migrations/update_kfna_instructors';
import { updateKfnaImages } from './migrations/update_kfna_images';
import { permanentFixKfnaImages } from './migrations/permanent_fix_kfna_images';
import { updateNfsWestInstructors } from './migrations/update_nfs_west_instructors';
import { updateNfsWestImages } from './migrations/update_nfs_west_images';
import { permanentFixNfsWestImages } from './migrations/permanent_fix_nfs_west_images';
import { addCompletedDateField } from './migrations/add_completed_date';
import { addColumnsToEvaluations } from './migrations/add_columns_to_evaluations';
import { addNotificationsTable } from './migrations/add_notifications_table';
import { addStaffCounselingTable } from './migrations/add_staff_counseling_table';
import { addPtoBalanceTable } from './migrations/add_pto_balance_table';

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
    
    // Check if NFS East images have been permanently fixed
    const settingsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'system_settings'
      );
    `);
    
    let nfsEastFixed = false;
    
    if (settingsCheck.rows[0].exists) {
      const fixCheck = await db.execute(sql`
        SELECT value FROM system_settings
        WHERE key = 'nfs_east_images_fixed';
      `);
      
      nfsEastFixed = fixCheck.rows.length > 0 && fixCheck.rows[0].value === 'true';
    }
    
    // If not fixed yet, apply the updates and permanent fix
    if (!nfsEastFixed) {
      console.log("Applying NFS East instructor updates and permanent fix...");
      
      // Update NFS East instructors
      await updateNfsEastInstructors();
      
      // Skip the normal update and apply the permanent fix directly
      await permanentFixNfsEastImages();
    } else {
      console.log("NFS East images are already permanently fixed, skipping updates");
    }
    
    // Check if KFNA images have been permanently fixed
    let kfnaFixed = false;
    
    if (settingsCheck.rows[0].exists) {
      const kfnaFixCheck = await db.execute(sql`
        SELECT value FROM system_settings
        WHERE key = 'kfna_images_fixed';
      `);
      
      kfnaFixed = kfnaFixCheck.rows.length > 0 && kfnaFixCheck.rows[0].value === 'true';
    }
    
    // If not fixed yet, apply the permanent fix only for KFNA
    if (!kfnaFixed) {
      console.log("Applying KFNA instructor permanent image fix...");
      
      // Skip the problematic instructor update and just apply the image fixes
      try {
        await permanentFixKfnaImages();
      } catch (error) {
        console.error("Error fixing KFNA images:", error);
      }
    } else {
      console.log("KFNA images are already permanently fixed, skipping updates");
    }
    
    // Check if NFS West images have been permanently fixed
    let nfsWestFixed = false;
    
    if (settingsCheck.rows[0].exists) {
      const westFixCheck = await db.execute(sql`
        SELECT value FROM system_settings
        WHERE key = 'nfs_west_images_fixed';
      `);
      
      nfsWestFixed = westFixCheck.rows.length > 0 && westFixCheck.rows[0].value === 'true';
    }
    
    // If not fixed yet, apply the permanent fix only for NFS West
    if (!nfsWestFixed) {
      console.log("Applying NFS West instructor permanent image fix...");
      
      // Skip the problematic instructor update and just apply the image fixes
      try {
        await permanentFixNfsWestImages();
      } catch (error) {
        console.error("Error fixing NFS West images:", error);
      }
    } else {
      console.log("NFS West images are already permanently fixed, skipping updates");
    }
    
    // Add completed_date field to action_logs table
    await addCompletedDateField();
    
    // Add evaluationType and employeeId columns to evaluations table
    await addColumnsToEvaluations();
    
    // Add notifications table
    await addNotificationsTable();
    
    // Add staff counseling table
    await addStaffCounselingTable();
    
    // Add PTO balance table
    await addPtoBalanceTable();
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}