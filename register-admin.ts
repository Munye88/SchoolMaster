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

async function registerAdmin() {
  try {
    const hashedPassword = await hashPassword("adminpass");
    
    // Check if admin user exists
    const existingUser = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (existingUser.length > 0) {
      // Update existing admin user
      const result = await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, 'admin'))
        .returning();
      
      console.log("Admin password updated successfully:", result[0]);
    } else {
      // Insert admin user
      const result = await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        name: "Administrator",
        email: "admin@example.com"
      }).returning();
      
      console.log("Admin created successfully:", result[0]);
    }
  } catch (error) {
    console.error("Error creating/updating admin:", error);
  }
}

registerAdmin().then(() => process.exit(0)).catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});