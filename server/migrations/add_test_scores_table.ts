import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function addTestScoresTable() {
  try {
    console.log('Adding test_scores table...');
    
    // Check if test_scores table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'test_scores'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      await db.execute(sql`
        CREATE TABLE test_scores (
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
      
      console.log('✅ Test scores table created successfully');
    } else {
      console.log('Test scores table already exists, skipping creation');
    }
    
  } catch (error) {
    console.error('❌ Error adding test scores table:', error);
    throw error;
  }
}