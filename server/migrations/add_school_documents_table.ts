import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function addSchoolDocumentsTable() {
  try {
    console.log('Adding school_documents table...');
    
    // Check if table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'school_documents'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('School documents table already exists, skipping creation');
      return;
    }
    
    // Create the school_documents table
    await db.execute(sql`
      CREATE TABLE school_documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        document_type TEXT NOT NULL,
        school_id INTEGER NOT NULL REFERENCES schools(id),
        uploaded_by INTEGER NOT NULL REFERENCES users(id),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );
    `);
    
    console.log('School documents table created successfully');
  } catch (error) {
    console.error('Error adding school documents table:', error);
    // Don't throw error to prevent breaking the initialization
  }
}