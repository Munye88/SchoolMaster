import { db } from './db';
import { schools, instructors, courses, activities, events, documents } from '@shared/schema';

export async function initDatabase() {
  try {
    // Check if database is already initialized
    const existingSchools = await db.select().from(schools);
    if (existingSchools.length > 0) {
      console.log('Database already initialized, but reinitializing to add new courses');
      await db.delete(activities);
      await db.delete(documents);
      await db.delete(events);
      await db.delete(courses);
      await db.delete(instructors);
      await db.delete(schools);
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
    
    // Create instructors for KNFA - 20 instructors
    const knfaInstructorPromises = [
      { name: "John Smith", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2020-06-01"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241001", accompaniedStatus: "Accompanied", role: "Senior English Language Instructor", imageUrl: "" },
      { name: "David Miller", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2020-08-15"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241002", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Robert Wilson", nationality: "British", credentials: "DELTA, BA in English", startDate: new Date("2021-01-10"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241003", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Michael Johnson", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-03-22"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241004", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "James Thompson", nationality: "American", credentials: "MA in Education", startDate: new Date("2021-05-12"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241005", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Thomas Brown", nationality: "British", credentials: "CELTA, MA in Linguistics", startDate: new Date("2021-07-18"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241006", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "William Davis", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-09-05"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241007", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Richard Taylor", nationality: "Canadian", credentials: "BA in English, CELTA", startDate: new Date("2021-11-14"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241008", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Charles Martinez", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2022-01-07"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241009", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Donald Harris", nationality: "British", credentials: "DELTA, MA in TESOL", startDate: new Date("2022-02-28"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241010", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Daniel Anderson", nationality: "American", credentials: "MA in Education", startDate: new Date("2022-04-11"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241011", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Matthew Jackson", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2022-06-30"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241012", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Anthony White", nationality: "American", credentials: "BA in English, CELTA", startDate: new Date("2022-08-15"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241013", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Mark Thompson", nationality: "British", credentials: "MA in Applied Linguistics", startDate: new Date("2022-10-07"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241014", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Paul Scott", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-12-01"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241015", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "George Clark", nationality: "Canadian", credentials: "DELTA, BA in English", startDate: new Date("2023-01-22"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241016", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Kenneth Lewis", nationality: "American", credentials: "MA in Education", startDate: new Date("2023-03-15"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241017", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Steven Hall", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2023-05-10"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241018", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Edward Young", nationality: "Canadian", credentials: "MA in Applied Linguistics", startDate: new Date("2023-07-05"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966550241019", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Brian Allen", nationality: "American", credentials: "CELTA, MA in Linguistics", startDate: new Date("2023-09-01"), compound: "Al Reem", schoolId: knfa.id, phone: "+966550241020", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" }
    ].map(instructor => {
      return db.insert(instructors).values({
        ...instructor,
        startDate: instructor.startDate.toISOString()
      }).returning();
    });
    
    const knfaInstructors = await Promise.all(knfaInstructorPromises);
    
    // Create instructors for NFS East - 20 instructors
    const nfsEastInstructorPromises = [
      { name: "John Doe", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-06-01"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550241234", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Alan Parker", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2020-07-15"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242001", accompaniedStatus: "Accompanied", role: "Senior English Language Instructor", imageUrl: "" },
      { name: "Jason Walker", nationality: "British", credentials: "DELTA, BA in English", startDate: new Date("2020-09-22"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242002", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Ryan Evans", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2021-02-10"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242003", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Kevin Carter", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-04-05"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242004", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Eric Foster", nationality: "American", credentials: "BA in English, CELTA", startDate: new Date("2021-06-20"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242005", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Scott Harrison", nationality: "British", credentials: "MA in Education", startDate: new Date("2021-08-15"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242006", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Brandon Nelson", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-10-12"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242007", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Andrew Peterson", nationality: "Canadian", credentials: "DELTA, MA in Linguistics", startDate: new Date("2021-12-05"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242008", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Adam Russell", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2022-01-28"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242009", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Greg Watson", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2022-03-15"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242010", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Peter Coleman", nationality: "American", credentials: "BA in English, CELTA", startDate: new Date("2022-05-10"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242011", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Aaron Hayes", nationality: "Canadian", credentials: "MA in Education", startDate: new Date("2022-07-22"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242012", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Jack Myers", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-09-08"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242013", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Luke Morris", nationality: "British", credentials: "DELTA, BA in English", startDate: new Date("2022-11-15"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242014", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Cole Burns", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2023-01-10"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242015", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Justin Greene", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2023-03-07"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242016", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Bradley Fuller", nationality: "American", credentials: "MA in Education", startDate: new Date("2023-05-22"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242017", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Sean Howard", nationality: "British", credentials: "CELTA, MA in Linguistics", startDate: new Date("2023-07-18"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966550242018", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Kyle Long", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2023-09-12"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966550242019", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" }
    ].map(instructor => {
      return db.insert(instructors).values({
        ...instructor,
        startDate: instructor.startDate.toISOString()
      }).returning();
    });
    
    const nfsEastInstructors = await Promise.all(nfsEastInstructorPromises);
    
    // Create instructors for NFS West - 20 instructors
    const nfsWestInstructorPromises = [
      { name: "Patrick Hughes", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2020-08-01"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243001", accompaniedStatus: "Accompanied", role: "Senior English Language Instructor", imageUrl: "" },
      { name: "Timothy Reed", nationality: "British", credentials: "DELTA, MA in Linguistics", startDate: new Date("2020-10-15"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243002", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Benjamin Morgan", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2021-01-05"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243003", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Joel Cooper", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-03-18"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243004", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Nathan Bailey", nationality: "American", credentials: "BA in English, CELTA", startDate: new Date("2021-05-22"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243005", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Raymond Perry", nationality: "British", credentials: "MA in Education", startDate: new Date("2021-07-10"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243006", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Samuel Powell", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-09-15"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243007", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Jerry Butler", nationality: "Canadian", credentials: "DELTA, BA in English", startDate: new Date("2021-11-07"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243008", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Dennis Simmons", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2022-01-22"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243009", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Walter Bryant", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2022-03-10"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243010", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Henry Russell", nationality: "American", credentials: "BA in English, CELTA", startDate: new Date("2022-05-01"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243011", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Arthur Griffin", nationality: "Canadian", credentials: "MA in Education", startDate: new Date("2022-07-14"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243012", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Roger Woods", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-09-12"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243013", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Lawrence Gordon", nationality: "British", credentials: "DELTA, MA in Linguistics", startDate: new Date("2022-11-05"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243014", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Terry Warren", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2023-01-15"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243015", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Jesse Hunt", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2023-03-22"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243016", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Keith Harvey", nationality: "American", credentials: "MA in Education", startDate: new Date("2023-05-08"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243017", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Louis Spencer", nationality: "British", credentials: "CELTA, BA in English", startDate: new Date("2023-07-11"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243018", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Ralph Willis", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2023-09-05"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966550243019", accompaniedStatus: "Accompanied", role: "English Language Instructor", imageUrl: "" },
      { name: "Gerald Jordan", nationality: "Canadian", credentials: "MA in Applied Linguistics", startDate: new Date("2023-10-20"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966550243020", accompaniedStatus: "Unaccompanied", role: "English Language Instructor", imageUrl: "" }
    ].map(instructor => {
      return db.insert(instructors).values({
        ...instructor,
        startDate: instructor.startDate.toISOString()
      }).returning();
    });
    
    const nfsWestInstructors = await Promise.all(nfsWestInstructorPromises);
    
    // Use the first instructor from each school for courses
    const johnDoe = nfsEastInstructors[0][0];  // First instructor from NFS East
    const johnSmith = knfaInstructors[0][0];   // First instructor from KNFA
    const patrickHughes = nfsWestInstructors[0][0]; // First instructor from NFS West

    // Create courses
    // Original Aviation course
    await db.insert(courses).values({
      name: "Aviation",
      studentCount: 27,
      startDate: new Date("2024-09-01").toISOString(),
      endDate: new Date("2024-12-15").toISOString(),
      instructorId: johnDoe.id,
      schoolId: nfsEast.id,
      status: "In Progress",
      progress: 45,
      benchmark: "75 ALCPT"
    });
    
    // Additional courses
    await db.insert(courses).values({
      name: "Refresher",
      studentCount: 40,
      startDate: new Date("2024-12-01").toISOString(),
      endDate: new Date("2025-05-22").toISOString(),
      instructorId: johnSmith.id,
      schoolId: knfa.id,
      status: "Starting Soon",
      progress: 0,
      benchmark: "45 ALCPT"
    });
    
    await db.insert(courses).values({
      name: "MMSC-223/224",
      studentCount: 5,
      startDate: new Date("2025-01-01").toISOString(),
      endDate: new Date("2025-05-30").toISOString(),
      instructorId: patrickHughes.id,
      schoolId: nfsWest.id,
      status: "Starting Soon",
      progress: 0,
      benchmark: "45 ALCPT"
    });
    
    // Add additional courses to reach 5 total
    await db.insert(courses).values({
      name: "Aviation English II",
      studentCount: 18,
      startDate: new Date("2024-08-15").toISOString(),
      endDate: new Date("2024-11-30").toISOString(),
      instructorId: nfsEastInstructors[1][0].id, // Alan Parker
      schoolId: nfsEast.id,
      status: "In Progress",
      progress: 65,
      benchmark: "70 ALCPT"
    });
    
    await db.insert(courses).values({
      name: "Technical English",
      studentCount: 22,
      startDate: new Date("2024-07-10").toISOString(),
      endDate: new Date("2024-10-15").toISOString(),
      instructorId: knfaInstructors[2][0].id, // Robert Wilson
      schoolId: knfa.id,
      status: "In Progress",
      progress: 85,
      benchmark: "60 ALCPT"
    });
    
    // Create sample events
    await db.insert(events).values({
      title: "Staff Meeting",
      start: new Date("2024-10-05T09:00:00"),
      end: new Date("2024-10-05T10:30:00"),
      description: "Monthly staff meeting",
      schoolId: nfsEast.id
    });
    
    await db.insert(events).values({
      title: "Quarterly Review",
      start: new Date("2024-10-08T11:00:00"),
      end: new Date("2024-10-08T13:00:00"),
      description: "Q3 performance review",
      schoolId: knfa.id
    });
    
    await db.insert(events).values({
      title: "New Course Orientation",
      start: new Date("2024-10-12T14:00:00"),
      end: new Date("2024-10-12T16:00:00"),
      description: "Orientation for new technical course",
      schoolId: nfsWest.id
    });
    
    // Create administrative documents
    await db.insert(documents).values({
      title: "Company Policy Document",
      type: "policy",
      uploadDate: new Date(),
      fileUrl: "https://docs.google.com/document/d/e/2PACX-1vQvnKG47TsZRIAqF4UlO67DbdX1dfRWWcKT3UQ-Yt-Wax0wrfae3YYXBbLM-h0ptCOC9dDzXjjwsC3-/pub?embedded=true",
      schoolId: null
    });

    await db.insert(documents).values({
      title: "Instructor Evaluation Guidelines",
      type: "evaluation",
      uploadDate: new Date(),
      fileUrl: "https://docs.google.com/document/d/e/2PACX-1vR9A_nz-xjjLCiqWx3kZN1QFQGUXHbnL_4SdI6fmSC9d5zMNKbhV-eCsxfmB7h4AaUbEZuiHoR-OFDW/pub?embedded=true",
      schoolId: null
    });

    await db.insert(documents).values({
      title: "Employee Handbook",
      type: "handbook",
      uploadDate: new Date(),
      fileUrl: "https://docs.google.com/document/d/e/2PACX-1vTuiO-YS6YrG6jMujVzAGQQx-N-WKzLIKJnB78GWcTiYSPXpj8ZjLLTZfm0JOGrSD7EINVbK9YjZ0Vc/pub?embedded=true",
      schoolId: null
    });

    await db.insert(documents).values({
      title: "Performance Evaluation Policy",
      type: "performance",
      uploadDate: new Date(),
      fileUrl: "https://docs.google.com/document/d/e/2PACX-1vTPkJarxZUO-3qLXV9EJc7fP11dQU8Pgg0IUw-R_20bXiSVQBCRc-wVJMylf7WJQsOA_PNKZmDbBNUz/pub?embedded=true",
      schoolId: null
    });

    await db.insert(documents).values({
      title: "Training Guide for Classroom Evaluation",
      type: "training",
      uploadDate: new Date(),
      fileUrl: "https://docs.google.com/document/d/e/2PACX-1vQEvgfxBCRGXxKqS3LvsZ2Ai5xfDakM22hiYWZh1HiHNXXLvdsRYyT2OkQ1TZ2wRbLCRcV9lrXY7vFW/pub?embedded=true",
      schoolId: null
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