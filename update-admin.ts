import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function updateAdminUser() {
  try {
    const hashedPassword = await hashPassword('Moon@7716');
    
    // Check if Munye88 exists
    const existingUser = await db.select().from(users).where(eq(users.username, 'Munye88'));
    
    if (existingUser.length > 0) {
      // Update existing user
      await db.update(users)
        .set({ 
          password: hashedPassword,
          role: 'admin',
          name: 'Munye Sufi',
          email: 'munyesufi1988@gmail.com'
        })
        .where(eq(users.username, 'Munye88'));
      console.log('✅ Updated admin user: Munye88');
    } else {
      // Create new admin user
      await db.insert(users).values({
        username: 'Munye88',
        password: hashedPassword,
        role: 'admin',
        name: 'Munye Sufi',
        email: 'munyesufi1988@gmail.com'
      });
      console.log('✅ Created admin user: Munye88');
    }
    
    // List all users to verify
    const allUsers = await db.select().from(users);
    console.log('\n📋 Current users:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  }
  
  process.exit(0);
}

updateAdminUser();