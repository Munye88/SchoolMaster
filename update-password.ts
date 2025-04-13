import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function updatePassword() {
  try {
    const newPassword = "Moon2025"; // Using username as password for simplicity
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the existing user's password
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, "Moon2025"))
      .returning();
    
    if (result.length > 0) {
      console.log("Password updated successfully for user:", result[0].username);
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error("Error updating password:", error);
  }
}

updatePassword().then(() => process.exit(0)).catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});