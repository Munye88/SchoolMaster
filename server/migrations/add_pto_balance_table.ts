import { db } from "../db";
import { ptoBalance } from "../../shared/schema";
import { sql } from "drizzle-orm";

export async function addPtoBalanceTable() {
  try {
    console.log("Adding pto_balance table...");
    
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pto_balance'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log("PTO balance table already exists, skipping creation");
      return;
    }
    
    // Create the table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pto_balance (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        year INTEGER NOT NULL,
        total_days INTEGER NOT NULL DEFAULT 21,
        used_days INTEGER NOT NULL DEFAULT 0,
        remaining_days INTEGER NOT NULL DEFAULT 21,
        adjustments INTEGER DEFAULT 0,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(instructor_id, year)
      )
    `);
    
    // Add constraint to ensure remaining_days is always non-negative
    await db.execute(sql`
      ALTER TABLE pto_balance 
      ADD CONSTRAINT pto_remaining_days_non_negative 
      CHECK (remaining_days >= 0)
    `);
    
    console.log("PTO balance table created successfully");
  } catch (error) {
    console.error("Error creating PTO balance table:", error);
    throw error;
  }
}