import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * This migration adds the completed_date column to the action_logs table
 */
export async function addCompletedDateField() {
  try {
    console.log('Adding completed_date column to action_logs table...');
    
    // Check if the column already exists
    const checkColumn = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'action_logs'
      AND column_name = 'completed_date'
    `);
    
    if (checkColumn.rows.length === 0) {
      // Add the column if it doesn't exist
      await db.execute(sql`
        ALTER TABLE action_logs
        ADD COLUMN completed_date TIMESTAMP
      `);
      
      // Set the completed_date for already completed items
      await db.execute(sql`
        UPDATE action_logs
        SET completed_date = NOW()
        WHERE status = 'completed' AND completed_date IS NULL
      `);
      
      console.log('Successfully added completed_date column');
    } else {
      console.log('completed_date column already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding completed_date column:', error);
    throw error;
  }
}