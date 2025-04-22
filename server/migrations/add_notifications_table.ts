import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function addNotificationsTable() {
  console.log("Adding notifications table...");
  
  try {
    // Check if notifications table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'notifications'
      );
    `);
    
    // If the table doesn't exist, create it
    if (!tableExists.rows[0].exists) {
      console.log('Creating notifications table...');
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'medium',
          related_id INTEGER,
          school_id INTEGER REFERENCES schools(id),
          is_read BOOLEAN NOT NULL DEFAULT false,
          is_dismissed BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          dismissed_at TIMESTAMP,
          expires_at TIMESTAMP,
          user_id INTEGER REFERENCES users(id)
        );
      `);
      
      console.log('Notifications table created successfully!');
      
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
          VALUES ('notifications_table_created', 'true')
          ON CONFLICT (key) DO UPDATE SET value = 'true';
        `);
      }
      
      return true;
    } else {
      console.log('Notifications table already exists.');
      return true;
    }
  } catch (error) {
    console.error('Error creating notifications table:', error);
    return false;
  }
}