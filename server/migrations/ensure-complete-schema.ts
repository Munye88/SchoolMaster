import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function ensureCompleteSchema() {
  try {
    console.log('🔧 Ensuring complete database schema for fresh deployment...');
    
    // Create schools table first if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        location TEXT
      );
    `);

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    // Create instructors table with ALL columns including email and extended fields
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        nationality TEXT NOT NULL,
        credentials TEXT NOT NULL,
        start_date DATE NOT NULL,
        compound TEXT NOT NULL,
        school_id INTEGER NOT NULL REFERENCES schools(id),
        phone TEXT NOT NULL,
        accompanied_status TEXT NOT NULL,
        image_url TEXT,
        role TEXT,
        email TEXT,
        date_of_birth DATE,
        passport_number TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT,
        contract_end_date DATE,
        salary INTEGER,
        department TEXT,
        status TEXT DEFAULT 'Active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        employment_status TEXT DEFAULT 'active',
        hire_date DATE
      );
    `);

    // Add all missing columns to existing instructors table if they don't exist
    const columnsToAdd = [
      'email TEXT',
      'date_of_birth DATE',
      'passport_number TEXT',
      'emergency_contact TEXT',
      'emergency_phone TEXT',
      'contract_end_date DATE',
      'salary INTEGER',
      'department TEXT',
      'status TEXT DEFAULT \'Active\'',
      'notes TEXT',
      'created_at TIMESTAMP DEFAULT NOW()',
      'updated_at TIMESTAMP DEFAULT NOW()',
      'emergency_contact_name TEXT',
      'emergency_contact_phone TEXT',
      'employment_status TEXT DEFAULT \'active\'',
      'hire_date DATE'
    ];

    for (const column of columnsToAdd) {
      try {
        await db.execute(sql.raw(`ALTER TABLE instructors ADD COLUMN IF NOT EXISTS ${column}`));
      } catch (error) {
        // Column might already exist, continue
        console.log(`Column already exists or error adding: ${column}`);
      }
    }

    // Create all other required tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        student_count INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        school_id INTEGER NOT NULL REFERENCES schools(id),
        status TEXT NOT NULL,
        progress INTEGER NOT NULL,
        benchmark TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        number_of_students INTEGER NOT NULL,
        school_id INTEGER NOT NULL REFERENCES schools(id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS evaluations (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        quarter TEXT NOT NULL,
        score INTEGER NOT NULL,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        student_name TEXT NOT NULL,
        school_id INTEGER NOT NULL REFERENCES schools(id),
        test_type TEXT NOT NULL,
        score INTEGER NOT NULL,
        date_taken DATE NOT NULL,
        instructor_id INTEGER REFERENCES instructors(id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        start DATE NOT NULL,
        end_date DATE,
        description TEXT,
        school_id INTEGER REFERENCES schools(id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff_attendance (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        status TEXT NOT NULL,
        time_in TEXT,
        time_out TEXT,
        comments TEXT,
        recorded_by INTEGER REFERENCES users(id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff_leave (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        instructor_name TEXT NOT NULL,
        leave_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        employee_id TEXT,
        attachment_url TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS action_logs (
        id SERIAL PRIMARY KEY,
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_date TIMESTAMP
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        instructor_id INTEGER REFERENCES instructors(id)
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff_counseling (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        instructor_name TEXT NOT NULL,
        session_date DATE NOT NULL,
        type TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pto_balance (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id),
        year INTEGER NOT NULL,
        total_days INTEGER NOT NULL DEFAULT 30,
        used_days INTEGER NOT NULL DEFAULT 0,
        remaining_days INTEGER NOT NULL DEFAULT 30,
        UNIQUE(instructor_id, year)
      );
    `);

    console.log('✅ Complete database schema ensured for fresh deployment');
  } catch (error) {
    console.error('❌ Error ensuring complete schema:', error);
    throw error;
  }
}