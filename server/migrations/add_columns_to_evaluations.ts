import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function addColumnsToEvaluations() {
  try {
    // Check if evaluation_type column exists in evaluations table
    const evalTypeCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'evaluations' 
        AND column_name = 'evaluation_type'
      );
    `);

    // If evaluation_type column doesn't exist, add it
    if (!evalTypeCheck.rows[0].exists) {
      console.log('Adding evaluation_type column to evaluations table');
      await db.execute(sql`
        ALTER TABLE evaluations 
        ADD COLUMN evaluation_type TEXT;
      `);
      console.log('evaluation_type column added successfully');
    }

    // Check if employee_id column exists in evaluations table
    const employeeIdCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'evaluations' 
        AND column_name = 'employee_id'
      );
    `);

    // If employee_id column doesn't exist, add it
    if (!employeeIdCheck.rows[0].exists) {
      console.log('Adding employee_id column to evaluations table');
      await db.execute(sql`
        ALTER TABLE evaluations 
        ADD COLUMN employee_id TEXT;
      `);
      console.log('employee_id column added successfully');
    }

    console.log('Evaluations table migration completed successfully');
  } catch (error) {
    console.error('Error adding columns to evaluations table:', error);
  }
}