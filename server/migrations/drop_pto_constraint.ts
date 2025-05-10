import { db } from "../db";
import { sql } from "drizzle-orm";

export async function dropPtoConstraint() {
  try {
    console.log("Checking PTO balance constraint...");
    
    // Check if constraint exists
    const constraintExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'pto_remaining_days_non_negative'
      );
    `);
    
    if (constraintExists.rows[0].exists) {
      console.log("Dropping PTO remaining_days constraint to allow automatic calculations...");
      
      // Drop the constraint
      await db.execute(sql`
        ALTER TABLE pto_balance 
        DROP CONSTRAINT IF EXISTS pto_remaining_days_non_negative
      `);
      
      console.log("PTO balance constraint dropped successfully");
    } else {
      console.log("PTO constraint does not exist, no action needed");
    }
  } catch (error) {
    console.error("Error modifying PTO balance constraint:", error);
    // Don't throw the error to avoid blocking other migrations
  }
}