import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function createAccessRequestsTable() {
  try {
    // Create the table directly (will ignore if exists)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS access_requests (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        reason TEXT NOT NULL,
        request_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP,
        processed_by TEXT
      );
    `);
    console.log('✅ Created access_requests table');
    
    // Check if we need to add a test request
    const existingRequests = await db.execute(sql`
      SELECT COUNT(*) as count FROM access_requests;
    `);
    
    if (existingRequests[0].count === '0') {
      // Add a test access request
      await db.execute(sql`
        INSERT INTO access_requests (full_name, email, reason, request_type)
        VALUES ('John Doe', 'john.doe@example.com', 'Need access to manage student records', 'registration');
      `);
      console.log('✅ Added test access request');
    } else {
      console.log('✅ access_requests table already has data');
    }
    
  } catch (error) {
    console.error('❌ Error creating access_requests table:', error);
  }
  
  process.exit(0);
}

createAccessRequestsTable();