import { db } from "../db";
import { staffLeave } from "../../shared/schema";
import { sql } from "drizzle-orm";

export async function addColumnsToStaffLeave() {
  try {
    console.log("Adding employee_id column to staff_leave table");
    await db.execute(sql`ALTER TABLE staff_leave ADD COLUMN IF NOT EXISTS employee_id TEXT`);
    
    console.log("Adding attachment_url column to staff_leave table");
    await db.execute(sql`ALTER TABLE staff_leave ADD COLUMN IF NOT EXISTS attachment_url TEXT`);
    
    console.log("Staff leave table migration completed successfully");
  } catch (error) {
    console.error("Error migrating staff_leave table:", error);
    throw error;
  }
}
