import {
  type User, type InsertUser,
  type School, type InsertSchool,
  type Instructor, type InsertInstructor,
  type Course, type InsertCourse,
  type Student, type InsertStudent,
  type TestResult, type InsertTestResult,
  type Evaluation, type InsertEvaluation,
  type Document, type InsertDocument,
  type Activity, type InsertActivity,
  type Event, type InsertEvent
} from "@shared/schema";

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
  
  // Instructor methods
  getInstructors(): Promise<Instructor[]>;
  getInstructor(id: number): Promise<Instructor | undefined>;
  getInstructorsBySchool(schoolId: number): Promise<Instructor[]>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  updateInstructor(id: number, instructor: Partial<InsertInstructor>): Promise<Instructor | undefined>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesBySchool(schoolId: number): Promise<Course[]>;
  getCoursesByInstructor(instructorId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentsBySchool(schoolId: number): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  
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

export const storage = new MemStorage();
