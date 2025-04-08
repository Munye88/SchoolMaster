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
      { name: "John Doe", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-06-20"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0405", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Michael Smith", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-07-15"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0406", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Robert Johnson", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-03-10"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0407", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "William Brown", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-04-22"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0408", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "David Jones", nationality: "American", credentials: "MA in Education", startDate: new Date("2021-05-12"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0409", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Richard Davis", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-06-18"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0410", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Joseph Miller", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-07-05"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0411", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Thomas Wilson", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-08-14"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0412", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Charles Moore", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2021-09-07"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0413", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Christopher Taylor", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-10-28"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0414", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Daniel Anderson", nationality: "American", credentials: "MA in Education", startDate: new Date("2021-11-11"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0415", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Matthew Thompson", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-12-30"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0416", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Anthony White", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-01-15"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0417", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Mark Harris", nationality: "British", credentials: "MA in Applied Linguistics", startDate: new Date("2022-02-07"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0418", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Paul Martin", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-03-01"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0419", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "George Clark", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2022-04-22"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0420", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Kenneth Lewis", nationality: "American", credentials: "MA in Education", startDate: new Date("2022-05-15"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0421", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Steven Hall", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2022-06-10"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0422", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Edward Young", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2022-07-05"), compound: "Al Hamra", schoolId: knfa.id, phone: "+966 55 223 0423", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Brian Allen", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-08-01"), compound: "Al Reem", schoolId: knfa.id, phone: "+966 55 223 0424", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" }
    ].map(instructor => {
      return db.insert(instructors).values({
        ...instructor,
        startDate: instructor.startDate.toISOString()
      }).returning();
    });
    
    const knfaInstructors = await Promise.all(knfaInstructorPromises);
    
    // Create instructors for NFS East - 20 instructors
    const nfsEastInstructorPromises = [
      { name: "James Walker", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-06-20"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0500", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Robert Evans", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-07-15"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0501", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "John Parker", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-03-10"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0502", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Michael Harrison", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-04-22"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0503", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "William Foster", nationality: "American", credentials: "MA in Education", startDate: new Date("2021-05-12"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0504", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "David Nelson", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-06-18"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0505", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Richard Peterson", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-07-05"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0506", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Joseph Russell", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-08-14"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0507", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Thomas Watson", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2021-09-07"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0508", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Charles Coleman", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-10-28"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0509", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Christopher Hayes", nationality: "American", credentials: "MA in Education", startDate: new Date("2021-11-11"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0510", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Daniel Myers", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-12-30"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0511", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Matthew Morris", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-01-15"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0512", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Anthony Burns", nationality: "British", credentials: "MA in Applied Linguistics", startDate: new Date("2022-02-07"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0513", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Mark Greene", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-03-01"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0514", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Paul Fuller", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2022-04-22"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0515", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "George Howard", nationality: "American", credentials: "MA in Education", startDate: new Date("2022-05-15"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0516", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Kenneth Long", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2022-06-10"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0517", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Steven Allen", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2022-07-05"), compound: "Al Hamra", schoolId: nfsEast.id, phone: "+966 55 223 0518", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Edward Wilson", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-08-01"), compound: "Al Reem", schoolId: nfsEast.id, phone: "+966 55 223 0519", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" }
    ].map(instructor => {
      return db.insert(instructors).values({
        ...instructor,
        startDate: instructor.startDate.toISOString()
      }).returning();
    });
    
    const nfsEastInstructors = await Promise.all(nfsEastInstructorPromises);
    
    // Create instructors for NFS West - 20 instructors
    const nfsWestInstructorPromises = [
      { name: "Andrew Hughes", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-06-20"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0600", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Frank Turner", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-07-15"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0601", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Peter Morgan", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-03-10"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0602", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Samuel Cooper", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-04-22"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0603", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Thomas Bailey", nationality: "American", credentials: "MA in Education", startDate: new Date("2021-05-12"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0604", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Harry Perry", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-06-18"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0605", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Jack Powell", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2021-07-05"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0606", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Oliver Butler", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-08-14"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0607", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Charlie Simmons", nationality: "American", credentials: "MA in Applied Linguistics", startDate: new Date("2021-09-07"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0608", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Jacob Bryant", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2021-10-28"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0609", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "George Russell", nationality: "American", credentials: "MA in Education", startDate: new Date("2021-11-11"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0610", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Noah Griffin", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2021-12-30"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0611", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Oscar Woods", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-01-15"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0612", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Leo Gordon", nationality: "British", credentials: "MA in Applied Linguistics", startDate: new Date("2022-02-07"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0613", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Ryan Warren", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-03-01"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0614", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Aaron Hunt", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2022-04-22"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0615", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Kyle Harvey", nationality: "American", credentials: "MA in Education", startDate: new Date("2022-05-15"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0616", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Ethan Spencer", nationality: "British", credentials: "MA in TESOL", startDate: new Date("2022-06-10"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0617", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Adam Willis", nationality: "Canadian", credentials: "MA in TESOL", startDate: new Date("2022-07-05"), compound: "Al Hamra", schoolId: nfsWest.id, phone: "+966 55 223 0618", accompaniedStatus: "Accompanied", role: "ELT Instructor", imageUrl: "" },
      { name: "Dylan Jordan", nationality: "American", credentials: "MA in TESOL", startDate: new Date("2022-08-01"), compound: "Al Reem", schoolId: nfsWest.id, phone: "+966 55 223 0619", accompaniedStatus: "Unaccompanied", role: "ELT Instructor", imageUrl: "" }
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