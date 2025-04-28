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
    // Get username and new password from command line arguments
    const args = process.argv.slice(2);
    const username = args[0] || "Moon2025";
    const newPassword = args[1] || "NewPassword2025!";
    
    if (args.length < 2) {
      console.log("Usage: tsx update-password.ts <username> <newPassword>");
      console.log(`Using default values: username="${username}", password="${newPassword}"`);
    }
    
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the existing user's password
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, username))
      .returning();
    
    if (result.length > 0) {
      console.log("Password updated successfully for user:", result[0].username);
      console.log("The user can now log in with their new password.");
    } else {
      console.log(`User "${username}" not found`);
      console.log("Available users:");
      
      // Show available usernames for reference
      const allUsers = await db.select({ username: users.username }).from(users);
      allUsers.forEach(user => console.log(`- ${user.username}`));
    }
  } catch (error) {
    console.error("Error updating password:", error);
  }
}

updatePassword().then(() => process.exit(0)).catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});