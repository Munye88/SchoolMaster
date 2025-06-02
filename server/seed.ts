import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    // Check if the user already exists
    const existingUser = await storage.getUserByUsername("munye88");
    
    if (!existingUser) {
      // Create the user if they don't exist
      const hashedPassword = await hashPassword("password123");
      
      const newUser = await storage.createUser({
        username: "munye88",
        password: hashedPassword,
        name: "Munye Sufi",
        email: "munyesufi1988@gmail.com",
        role: "admin"
      });
      
      console.log("✅ Seeded admin user:", newUser.username);
    } else {
      console.log("✅ Admin user already exists:", existingUser.username);
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}