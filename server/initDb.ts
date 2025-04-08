import { db } from './db';
import { schools, instructors, courses, activities, events } from '@shared/schema';

export async function initDatabase() {
  try {
    // Check if database is already initialized
    const existingSchools = await db.select().from(schools);
    if (existingSchools.length > 0) {
      console.log('Database already initialized, skipping initialization.');
      return;
    }

    console.log('Initializing database with sample data...');
    
    // Create schools
    const [knfa] = await db.insert(schools).values({
      name: "KNFA",
      code: "KNFA",
      location: "Riyadh"
    }).returning();
    
    const [nfsEast] = await db.insert(schools).values({
      name: "NFS East",
      code: "NFS_EAST",
      location: "Eastern Province"
    }).returning();
    
    const [nfsWest] = await db.insert(schools).values({
      name: "NFS West",
      code: "NFS_WEST",
      location: "Western Province"
    }).returning();
    
    // Create sample instructor
    const [johnDoe] = await db.insert(instructors).values({
      name: "John Doe",
      nationality: "American",
      credentials: "MA in TESOL",
      startDate: new Date("2021-06-01").toISOString(),
      compound: "Al Reem",
      schoolId: nfsEast.id,
      phone: "+966550241234",
      accompaniedStatus: "Accompanied",
      role: "English Language Instructor",
      imageUrl: ""
    }).returning();
    
    // Create sample course
    await db.insert(courses).values({
      name: "Aviation",
      studentCount: 27,
      startDate: new Date("2024-09-01").toISOString(),
      endDate: new Date("2024-12-15").toISOString(),
      instructorId: johnDoe.id,
      schoolId: nfsEast.id,
      status: "In Progress",
      progress: 45
    });
    
    // Create sample events
    await db.insert(events).values({
      title: "Staff Meeting",
      start: new Date("2024-10-05T09:00:00").toISOString(),
      end: new Date("2024-10-05T10:30:00").toISOString(),
      description: "Monthly staff meeting",
      schoolId: nfsEast.id
    });
    
    await db.insert(events).values({
      title: "Quarterly Review",
      start: new Date("2024-10-08T11:00:00").toISOString(),
      end: new Date("2024-10-08T13:00:00").toISOString(),
      description: "Q3 performance review",
      schoolId: knfa.id
    });
    
    await db.insert(events).values({
      title: "New Course Orientation",
      start: new Date("2024-10-12T14:00:00").toISOString(),
      end: new Date("2024-10-12T16:00:00").toISOString(),
      description: "Orientation for new technical course",
      schoolId: nfsWest.id
    });
    
    // Create sample activities
    await db.insert(activities).values({
      type: "course_added",
      description: "New course \"Advanced Aviation\" added",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      userId: null
    });
    
    await db.insert(activities).values({
      type: "instructor_added",
      description: "New instructor \"Sarah Johnson\" onboarded",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      userId: null
    });
    
    await db.insert(activities).values({
      type: "reports_submitted",
      description: "Monthly evaluation reports submitted",
      timestamp: new Date("2024-09-30"),
      userId: null
    });
    
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}