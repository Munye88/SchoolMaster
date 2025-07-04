import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function updateEvaluationSchema() {
  try {
    console.log('Starting evaluation schema update...');
    
    // First check if the new columns exist
    const columns = [
      'overall_rating',
      'teaching_effectiveness', 
      'classroom_management',
      'professional_development',
      'communication',
      'strengths',
      'areas_for_improvement',
      'comments',
      'status',
      'follow_up_date',
      'completion_date',
      'created_at',
      'updated_at'
    ];
    
    for (const column of columns) {
      try {
        const columnExists = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'evaluations' 
            AND column_name = ${column}
          );
        `);
        
        if (!columnExists.rows[0].exists) {
          console.log(`Adding ${column} column to evaluations table`);
          
          switch (column) {
            case 'overall_rating':
            case 'teaching_effectiveness':
            case 'classroom_management':
            case 'professional_development':
            case 'communication':
              await db.execute(sql`
                ALTER TABLE evaluations 
                ADD COLUMN ${sql.identifier(column)} INTEGER DEFAULT 1;
              `);
              break;
            case 'strengths':
            case 'areas_for_improvement':
            case 'comments':
            case 'follow_up_date':
            case 'completion_date':
              await db.execute(sql`
                ALTER TABLE evaluations 
                ADD COLUMN ${sql.identifier(column)} TEXT;
              `);
              break;
            case 'status':
              await db.execute(sql`
                ALTER TABLE evaluations 
                ADD COLUMN ${sql.identifier(column)} TEXT DEFAULT 'draft';
              `);
              break;
            case 'created_at':
            case 'updated_at':
              await db.execute(sql`
                ALTER TABLE evaluations 
                ADD COLUMN ${sql.identifier(column)} TIMESTAMP DEFAULT NOW();
              `);
              break;
          }
          console.log(`${column} column added successfully`);
        }
      } catch (error) {
        console.log(`Column ${column} might already exist or error occurred:`, error.message);
      }
    }
    
    // Update evaluation_date to be required if it's not already
    try {
      await db.execute(sql`
        UPDATE evaluations 
        SET evaluation_date = CURRENT_DATE::text 
        WHERE evaluation_date IS NULL;
      `);
    } catch (error) {
      console.log('Error updating null evaluation dates:', error.message);
    }
    
    // Update year column to be required if it's not already
    try {
      await db.execute(sql`
        UPDATE evaluations 
        SET year = EXTRACT(YEAR FROM CURRENT_DATE)::text 
        WHERE year IS NULL;
      `);
    } catch (error) {
      console.log('Error updating null years:', error.message);
    }
    
    console.log('Evaluation schema update completed successfully');
  } catch (error) {
    console.error('Error updating evaluation schema:', error);
  }
}