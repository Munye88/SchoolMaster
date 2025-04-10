import {
  type User, type InsertUser, users,
  type School, type InsertSchool, schools,
  type Instructor, type InsertInstructor, instructors,
  type Course, type InsertCourse, courses,
  type Student, type InsertStudent, students,
  type TestResult, type InsertTestResult, testResults,
  type Evaluation, type InsertEvaluation, evaluations,
  type Document, type InsertDocument, documents,
  type Activity, type InsertActivity, activities,
  type Event, type InsertEvent, events
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, lt, gt, and, isNull, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // School methods
  getSchools(): Promise<School[]>;
  getSchool(id: number): Promise<School | undefined>;
  getSchoolByCode(code: string): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined>;
  deleteSchool(id: number): Promise<void>;
  
  // Instructor methods
  getInstructors(): Promise<Instructor[]>;
  getInstructor(id: number): Promise<Instructor | undefined>;
  getInstructorsBySchool(schoolId: number): Promise<Instructor[]>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  updateInstructor(id: number, instructor: Partial<InsertInstructor>): Promise<Instructor | undefined>;
  deleteInstructor(id: number): Promise<void>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesBySchool(schoolId: number): Promise<Course[]>;
  getCoursesByInstructor(instructorId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<void>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentsBySchool(schoolId: number): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<void>;
  
  // Test Result methods
  getTestResults(): Promise<TestResult[]>;
  getTestResult(id: number): Promise<TestResult | undefined>;
  getTestResultsByStudent(studentId: number): Promise<TestResult[]>;
  getTestResultsByCourse(courseId: number): Promise<TestResult[]>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  
  // Evaluation methods
  getEvaluations(): Promise<Evaluation[]>;
  getEvaluation(id: number): Promise<Evaluation | undefined>;
  getEvaluationsByInstructor(instructorId: number): Promise<Evaluation[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  
  // Document methods
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsBySchool(schoolId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getUpcomingEvents(limit: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private schools: Map<number, School>;
  private instructors: Map<number, Instructor>;
  private courses: Map<number, Course>;
  private students: Map<number, Student>;
  private testResults: Map<number, TestResult>;
  private evaluations: Map<number, Evaluation>;
  private documents: Map<number, Document>;
  private activities: Map<number, Activity>;
  private events: Map<number, Event>;
  
  private currentIds: {
    user: number;
    school: number;
    instructor: number;
    course: number;
    student: number;
    testResult: number;
    evaluation: number;
    document: number;
    activity: number;
    event: number;
  };

  constructor() {
    this.users = new Map();
    this.schools = new Map();
    this.instructors = new Map();
    this.courses = new Map();
    this.students = new Map();
    this.testResults = new Map();
    this.evaluations = new Map();
    this.documents = new Map();
    this.activities = new Map();
    this.events = new Map();
    
    this.currentIds = {
      user: 1,
      school: 1,
      instructor: 1,
      course: 1,
      student: 1,
      testResult: 1,
      evaluation: 1,
      document: 1,
      activity: 1,
      event: 1
    };
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create schools
    const knfa = this.createSchool({ name: "KNFA", code: "KNFA", location: "Riyadh" });
    const nfsEast = this.createSchool({ name: "NFS East", code: "NFS_EAST", location: "Eastern Province" });
    const nfsWest = this.createSchool({ name: "NFS West", code: "NFS_WEST", location: "Western Province" });
    
    // Create sample instructor
    const johnDoe = this.createInstructor({
      name: "John Doe",
      nationality: "American",
      credentials: "MA in TESOL",
      startDate: new Date("2021-06-01"),
      compound: "Al Reem",
      schoolId: nfsEast.id,
      phone: "+966550241234",
      accompaniedStatus: "Accompanied",
      role: "English Language Instructor",
      imageUrl: ""
    });
    
    // Create sample courses
    this.createCourse({
      name: "Aviation",
      studentCount: 27,
      startDate: new Date("2024-09-01"),
      endDate: new Date("2024-12-15"),
      instructorId: johnDoe.id,
      schoolId: nfsEast.id,
      status: "In Progress",
      progress: 45
    });
    
    // Create sample events
    this.createEvent({
      title: "Staff Meeting",
      start: new Date("2024-10-05T09:00:00"),
      end: new Date("2024-10-05T10:30:00"),
      description: "Monthly staff meeting",
      schoolId: nfsEast.id
    });
    
    this.createEvent({
      title: "Quarterly Review",
      start: new Date("2024-10-08T11:00:00"),
      end: new Date("2024-10-08T13:00:00"),
      description: "Q3 performance review",
      schoolId: knfa.id
    });
    
    this.createEvent({
      title: "New Course Orientation",
      start: new Date("2024-10-12T14:00:00"),
      end: new Date("2024-10-12T16:00:00"),
      description: "Orientation for new technical course",
      schoolId: nfsWest.id
    });
    
    // Create sample activities
    this.createActivity({
      type: "course_added",
      description: "New course \"Advanced Aviation\" added",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      userId: 1
    });
    
    this.createActivity({
      type: "instructor_added",
      description: "New instructor \"Sarah Johnson\" onboarded",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      userId: 1
    });
    
    this.createActivity({
      type: "reports_submitted",
      description: "Monthly evaluation reports submitted",
      timestamp: new Date("2024-09-30"),
      userId: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // School methods
  async getSchools(): Promise<School[]> {
    return Array.from(this.schools.values());
  }
  
  async getSchool(id: number): Promise<School | undefined> {
    return this.schools.get(id);
  }
  
  async getSchoolByCode(code: string): Promise<School | undefined> {
    return Array.from(this.schools.values()).find(
      (school) => school.code === code,
    );
  }
  
  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const id = this.currentIds.school++;
    const school: School = { ...insertSchool, id };
    this.schools.set(id, school);
    return school;
  }
  
  async updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined> {
    const existing = await this.getSchool(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...school };
    this.schools.set(id, updated);
    return updated;
  }
  
  async deleteSchool(id: number): Promise<void> {
    this.schools.delete(id);
  }
  
  // Instructor methods
  async getInstructors(): Promise<Instructor[]> {
    return Array.from(this.instructors.values());
  }
  
  async getInstructor(id: number): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }
  
  async getInstructorsBySchool(schoolId: number): Promise<Instructor[]> {
    return Array.from(this.instructors.values()).filter(
      (instructor) => instructor.schoolId === schoolId,
    );
  }
  
  async createInstructor(insertInstructor: InsertInstructor): Promise<Instructor> {
    const id = this.currentIds.instructor++;
    const instructor: Instructor = { ...insertInstructor, id };
    this.instructors.set(id, instructor);
    return instructor;
  }
  
  async updateInstructor(id: number, instructor: Partial<InsertInstructor>): Promise<Instructor | undefined> {
    const existing = await this.getInstructor(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...instructor };
    this.instructors.set(id, updated);
    return updated;
  }
  
  async deleteInstructor(id: number): Promise<void> {
    this.instructors.delete(id);
  }
  
  // Course methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCoursesBySchool(schoolId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.schoolId === schoolId,
    );
  }
  
  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.instructorId === instructorId,
    );
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentIds.course++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  
  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined> {
    const existing = await this.getCourse(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...course };
    this.courses.set(id, updated);
    return updated;
  }
  
  async deleteCourse(id: number): Promise<void> {
    this.courses.delete(id);
  }
  
  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async getStudentsBySchool(schoolId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.schoolId === schoolId,
    );
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentIds.student++;
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }
  
  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = await this.getStudent(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...student };
    this.students.set(id, updated);
    return updated;
  }
  
  async deleteStudent(id: number): Promise<void> {
    this.students.delete(id);
  }
  
  // Test Result methods
  async getTestResults(): Promise<TestResult[]> {
    return Array.from(this.testResults.values());
  }
  
  async getTestResult(id: number): Promise<TestResult | undefined> {
    return this.testResults.get(id);
  }
  
  async getTestResultsByStudent(studentId: number): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).filter(
      (result) => result.studentId === studentId,
    );
  }
  
  async getTestResultsByCourse(courseId: number): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).filter(
      (result) => result.courseId === courseId,
    );
  }
  
  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const id = this.currentIds.testResult++;
    const testResult: TestResult = { ...insertTestResult, id };
    this.testResults.set(id, testResult);
    return testResult;
  }
  
  // Evaluation methods
  async getEvaluations(): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values());
  }
  
  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    return this.evaluations.get(id);
  }
  
  async getEvaluationsByInstructor(instructorId: number): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values()).filter(
      (evaluation) => evaluation.instructorId === instructorId,
    );
  }
  
  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.currentIds.evaluation++;
    const evaluation: Evaluation = { ...insertEvaluation, id };
    this.evaluations.set(id, evaluation);
    return evaluation;
  }
  
  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsBySchool(schoolId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.schoolId === schoolId || document.schoolId === null,
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentIds.document++;
    const document: Document = { ...insertDocument, id };
    this.documents.set(id, document);
    return document;
  }
  
  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentIds.activity++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getUpcomingEvents(limit: number): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => event.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, limit);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentIds.event++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // School methods
  async getSchools(): Promise<School[]> {
    return db.select().from(schools);
  }
  
  async getSchool(id: number): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }
  
  async getSchoolByCode(code: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.code, code));
    return school;
  }
  
  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const [school] = await db.insert(schools).values(insertSchool).returning();
    return school;
  }
  
  async updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined> {
    const [updated] = await db
      .update(schools)
      .set(school)
      .where(eq(schools.id, id))
      .returning();
    return updated;
  }
  
  async deleteSchool(id: number): Promise<void> {
    await db.delete(schools).where(eq(schools.id, id));
  }
  
  // Instructor methods
  async getInstructors(): Promise<Instructor[]> {
    return db.select().from(instructors);
  }
  
  async getInstructor(id: number): Promise<Instructor | undefined> {
    const [instructor] = await db.select().from(instructors).where(eq(instructors.id, id));
    return instructor;
  }
  
  async getInstructorsBySchool(schoolId: number): Promise<Instructor[]> {
    return db.select().from(instructors).where(eq(instructors.schoolId, schoolId));
  }
  
  async createInstructor(insertInstructor: InsertInstructor): Promise<Instructor> {
    const [instructor] = await db.insert(instructors).values(insertInstructor).returning();
    return instructor;
  }
  
  async updateInstructor(id: number, instructor: Partial<InsertInstructor>): Promise<Instructor | undefined> {
    const [updated] = await db
      .update(instructors)
      .set(instructor)
      .where(eq(instructors.id, id))
      .returning();
    return updated;
  }
  
  // Course methods
  async getCourses(): Promise<Course[]> {
    return db.select().from(courses);
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  
  async getCoursesBySchool(schoolId: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.schoolId, schoolId));
  }
  
  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.instructorId, instructorId));
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }
  
  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db
      .update(courses)
      .set(course)
      .where(eq(courses.id, id))
      .returning();
    return updated;
  }
  
  // Student methods
  async getStudents(): Promise<Student[]> {
    return db.select().from(students);
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }
  
  async getStudentsBySchool(schoolId: number): Promise<Student[]> {
    return db.select().from(students).where(eq(students.schoolId, schoolId));
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }
  
  // Test Result methods
  async getTestResults(): Promise<TestResult[]> {
    return db.select().from(testResults);
  }
  
  async getTestResult(id: number): Promise<TestResult | undefined> {
    const [testResult] = await db.select().from(testResults).where(eq(testResults.id, id));
    return testResult;
  }
  
  async getTestResultsByStudent(studentId: number): Promise<TestResult[]> {
    return db.select().from(testResults).where(eq(testResults.studentId, studentId));
  }
  
  async getTestResultsByCourse(courseId: number): Promise<TestResult[]> {
    return db.select().from(testResults).where(eq(testResults.courseId, courseId));
  }
  
  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const [testResult] = await db.insert(testResults).values(insertTestResult).returning();
    return testResult;
  }
  
  // Evaluation methods
  async getEvaluations(): Promise<Evaluation[]> {
    return db.select().from(evaluations);
  }
  
  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return evaluation;
  }
  
  async getEvaluationsByInstructor(instructorId: number): Promise<Evaluation[]> {
    return db.select().from(evaluations).where(eq(evaluations.instructorId, instructorId));
  }
  
  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const [evaluation] = await db.insert(evaluations).values(insertEvaluation).returning();
    return evaluation;
  }
  
  // Document methods
  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents);
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  async getDocumentsBySchool(schoolId: number): Promise<Document[]> {
    return db.select()
      .from(documents)
      .where(or(eq(documents.schoolId, schoolId), isNull(documents.schoolId)));
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }
  
  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return db.select().from(activities);
  }
  
  async getRecentActivities(limit: number): Promise<Activity[]> {
    return db.select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return db.select().from(events);
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }
  
  async getUpcomingEvents(limit: number): Promise<Event[]> {
    const now = new Date();
    return db.select()
      .from(events)
      .where(gt(events.start, now))
      .orderBy(events.start)
      .limit(limit);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
