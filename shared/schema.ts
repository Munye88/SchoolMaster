import { pgTable, text, serial, integer, boolean, date, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  location: text("location"),
});

export const insertSchoolSchema = createInsertSchema(schools).pick({
  name: true,
  code: true,
  location: true,
});

export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nationality: text("nationality").notNull(),
  credentials: text("credentials").notNull(),
  startDate: date("start_date").notNull(),
  compound: text("compound").notNull(),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  phone: text("phone").notNull(),
  accompaniedStatus: text("accompanied_status").notNull(),
  imageUrl: text("image_url"),
  role: text("role"),
});

export const insertInstructorSchema = createInsertSchema(instructors).pick({
  name: true,
  nationality: true,
  credentials: true,
  startDate: true,
  compound: true,
  schoolId: true,
  phone: true,
  accompaniedStatus: true,
  imageUrl: true,
  role: true,
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  studentCount: integer("student_count").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  instructorId: integer("instructor_id").notNull().references(() => instructors.id),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  status: text("status").notNull(),
  progress: integer("progress").notNull(),
  benchmark: text("benchmark"),
  // Archive status is determined client-side based on course completion date
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  name: true,
  studentCount: true,
  startDate: true,
  endDate: true,
  instructorId: true,
  schoolId: true,
  status: true,
  progress: true,
  benchmark: true,
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  numberOfStudents: integer("number_of_students").notNull(),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  courseType: text("course_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  numberOfStudents: true,
  schoolId: true,
  courseType: true,
  startDate: true,
  endDate: true,
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  testDate: date("test_date").notNull(),
  score: integer("score").notNull(),
  type: text("type").notNull(),
});

export const insertTestResultSchema = createInsertSchema(testResults).pick({
  studentId: true,
  courseId: true,
  testDate: true,
  score: true,
  type: true,
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull().references(() => instructors.id),
  quarter: text("quarter").notNull(),
  year: text("year").notNull(),
  score: integer("score").notNull(),
  evaluationDate: text("evaluation_date"),
  feedback: text("feedback"),
  evaluatorId: integer("evaluator_id").references(() => users.id),
  attachmentUrl: text("attachment_url"),
  evaluationType: text("evaluation_type"),
  employeeId: text("employee_id"),
});

export const insertEvaluationSchema = createInsertSchema(evaluations).pick({
  instructorId: true,
  quarter: true,
  year: true,
  score: true,
  evaluationDate: true,
  feedback: true,
  evaluatorId: true,
  attachmentUrl: true,
  evaluationType: true,
  employeeId: true,
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  schoolId: integer("school_id").references(() => schools.id),
  uploadDate: timestamp("upload_date").notNull(),
  fileUrl: text("file_url").notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  type: true,
  schoolId: true,
  uploadDate: true,
  fileUrl: true,
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  description: true,
  timestamp: true,
  userId: true,
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  schoolId: integer("school_id").references(() => schools.id),
  description: text("description"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  start: true,
  end: true,
  schoolId: true,
  description: true,
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
});

// Relations will be defined after all table definitions

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  school: one(schools, {
    fields: [instructors.schoolId],
    references: [schools.id],
  }),
  courses: many(courses),
  evaluations: many(evaluations),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(instructors, {
    fields: [courses.instructorId],
    references: [instructors.id],
  }),
  school: one(schools, {
    fields: [courses.schoolId],
    references: [schools.id],
  }),
  testResults: many(testResults),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.id],
  }),
  testResults: many(testResults),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  student: one(students, {
    fields: [testResults.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [testResults.courseId],
    references: [courses.id],
  }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  instructor: one(instructors, {
    fields: [evaluations.instructorId],
    references: [instructors.id],
  }),
  evaluator: one(users, {
    fields: [evaluations.evaluatorId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  school: one(schools, {
    fields: [documents.schoolId],
    references: [schools.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  school: one(schools, {
    fields: [events.schoolId],
    references: [schools.id],
  }),
}));

// Type exports
export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;

export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Staff Attendance System
export const staffAttendance = pgTable("staff_attendance", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  instructorId: integer("instructor_id").notNull().references(() => instructors.id),
  status: text("status", { 
    enum: ["present", "absent", "late", "sick", "paternity", "pto", "bereavement"] 
  }).notNull(),
  timeIn: text("time_in"),
  timeOut: text("time_out"),
  comments: text("comments"),
  recordedBy: integer("recorded_by").references(() => users.id)
});

export const insertStaffAttendanceSchema = createInsertSchema(staffAttendance).pick({
  date: true,
  instructorId: true,
  status: true,
  timeIn: true,
  timeOut: true,
  comments: true,
  recordedBy: true
});

export const staffAttendanceRelations = relations(staffAttendance, ({ one }) => ({
  instructor: one(instructors, {
    fields: [staffAttendance.instructorId],
    references: [instructors.id]
  }),
  recordedByUser: one(users, {
    fields: [staffAttendance.recordedBy],
    references: [users.id]
  })
}));

export type StaffAttendance = typeof staffAttendance.$inferSelect;
export type InsertStaffAttendance = z.infer<typeof insertStaffAttendanceSchema>;

// Notifications System
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", { 
    enum: ["absent", "leave", "evaluation", "student_change", "staff_change", "course_complete", "system"] 
  }).notNull(),
  priority: text("priority", { 
    enum: ["high", "medium", "low"] 
  }).notNull().default("medium"),
  relatedId: integer("related_id"),  // ID of related entity (instructor, course, etc.)
  schoolId: integer("school_id").references(() => schools.id),
  isRead: boolean("is_read").notNull().default(false),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  dismissedAt: timestamp("dismissed_at"),
  expiresAt: timestamp("expires_at"),
  userId: integer("user_id").references(() => users.id)  // User who should see this notification
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  title: true,
  message: true,
  type: true,
  priority: true,
  relatedId: true,
  schoolId: true,
  isRead: true,
  isDismissed: true,
  expiresAt: true,
  userId: true
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Type for Aggregated Test Data visualization
export interface AggregateTestData {
  id: number;
  cycle?: number;
  month?: string;
  year: number;
  testType: 'Book' | 'ALCPT' | 'ECL' | 'OPI';
  schoolId: number;
  schoolName: string;
  studentCount: number;
  averageScore: number;
  passingScore: number;
  passingRate: number;
}

// Staff Leave Tracker
export const staffLeave = pgTable("staff_leave", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull().references(() => instructors.id),
  employeeId: text("employee_id"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  returnDate: date("return_date").notNull(),
  ptodays: integer("ptodays").notNull(),
  rrdays: integer("rrdays").notNull(),
  leaveType: text("leave_type").default("PTO"),
  destination: text("destination").notNull(),
  status: text("status").notNull(), // e.g., "pending", "approved", "completed"
  comments: text("comments"),
  approvedBy: integer("approvedby").references(() => users.id),
  attachmentUrl: text("attachment_url")
});

export const insertStaffLeaveSchema = createInsertSchema(staffLeave).pick({
  instructorId: true,
  employeeId: true,
  startDate: true,
  endDate: true,
  returnDate: true,
  ptodays: true,
  rrdays: true,
  leaveType: true,
  destination: true,
  status: true,
  comments: true,
  approvedBy: true,
  attachmentUrl: true
});

export const staffLeaveRelations = relations(staffLeave, ({ one }) => ({
  instructor: one(instructors, {
    fields: [staffLeave.instructorId],
    references: [instructors.id]
  }),
  approver: one(users, {
    fields: [staffLeave.approvedBy],
    references: [users.id]
  })
}));

export type StaffLeave = typeof staffLeave.$inferSelect;
export type InsertStaffLeave = z.infer<typeof insertStaffLeaveSchema>;

// Action Log for tracking tasks and tickets
export const actionLogs = pgTable("action_logs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  requesterName: text("requester_name").notNull(),
  description: text("description").notNull(),
  createdDate: timestamp("created_date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  status: text("status", { 
    enum: ["pending", "completed", "under_review"] 
  }).notNull().default("pending"),
  category: text("category"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  schoolId: integer("school_id").references(() => schools.id),
});

export const insertActionLogSchema = createInsertSchema(actionLogs).pick({
  title: true,
  requesterName: true,
  description: true,
  createdDate: true,
  dueDate: true,
  completedDate: true,
  status: true,
  category: true,
  assignedTo: true,
  createdBy: true,
  schoolId: true,
});

export const actionLogsRelations = relations(actionLogs, ({ one }) => ({
  assignee: one(users, {
    fields: [actionLogs.assignedTo],
    references: [users.id]
  }),
  creator: one(users, {
    fields: [actionLogs.createdBy],
    references: [users.id]
  }),
  school: one(schools, {
    fields: [actionLogs.schoolId],
    references: [schools.id]
  })
}));

export type ActionLog = typeof actionLogs.$inferSelect;
export type InsertActionLog = z.infer<typeof insertActionLogSchema>;

// Staff Counseling System
export const staffCounseling = pgTable("staff_counseling", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull().references(() => instructors.id),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  counselingType: text("counseling_type", { 
    enum: ["Verbal Warning", "Written Warning", "Final Warning"] 
  }).notNull(),
  counselingDate: date("counseling_date").notNull(),
  comments: text("comments"),
  attachmentUrl: text("attachment_url"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertStaffCounselingSchema = createInsertSchema(staffCounseling).pick({
  instructorId: true,
  schoolId: true,
  counselingType: true,
  counselingDate: true,
  comments: true,
  attachmentUrl: true,
  createdBy: true,
  updatedAt: true
});

export const staffCounselingRelations = relations(staffCounseling, ({ one }) => ({
  instructor: one(instructors, {
    fields: [staffCounseling.instructorId],
    references: [instructors.id]
  }),
  school: one(schools, {
    fields: [staffCounseling.schoolId],
    references: [schools.id]
  }),
  creator: one(users, {
    fields: [staffCounseling.createdBy],
    references: [users.id]
  })
}));

export type StaffCounseling = typeof staffCounseling.$inferSelect;
export type InsertStaffCounseling = z.infer<typeof insertStaffCounselingSchema>;

// Recruitment System
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  nativeEnglishSpeaker: boolean("native_english_speaker").default(false),
  degree: text("degree"), // "Bachelor", "Master", "PhD", etc.
  degreeField: text("degree_field"), // "English", "ESL", "Education", etc.
  yearsExperience: integer("years_experience").default(0),
  hasCertifications: boolean("has_certifications").default(false),
  certifications: text("certifications"), // CELTA, TEFL, TESOL, etc.
  classroomManagement: integer("classroom_management").default(0), // Score 1-10
  militaryExperience: boolean("military_experience").default(false),
  grammarProficiency: integer("grammar_proficiency").default(0), // Score 1-10
  vocabularyProficiency: integer("vocabulary_proficiency").default(0), // Score 1-10
  overallScore: integer("overall_score").default(0), // Calculated score 
  resumeUrl: text("resume_url").notNull(), // URL to uploaded resume
  status: text("status", { 
    enum: ["new", "reviewed", "shortlisted", "interviewed", "hired", "rejected"] 
  }).notNull().default("new"),
  notes: text("notes"),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewDate: timestamp("review_date"),
  schoolId: integer("school_id").references(() => schools.id)
});

export const insertCandidateSchema = createInsertSchema(candidates).pick({
  name: true,
  email: true,
  phone: true,
  nativeEnglishSpeaker: true,
  degree: true,
  degreeField: true,
  yearsExperience: true,
  hasCertifications: true,
  certifications: true,
  classroomManagement: true,
  militaryExperience: true,
  grammarProficiency: true,
  vocabularyProficiency: true,
  overallScore: true,
  resumeUrl: true,
  status: true,
  notes: true,
  uploadDate: true,
  reviewedBy: true,
  reviewDate: true,
  schoolId: true
});

export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  question: text("question").notNull(),
  category: text("category", { 
    enum: ["general", "technical", "curriculum", "behavioral"] 
  }).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdDate: timestamp("created_date").notNull().defaultNow()
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions).pick({
  candidateId: true,
  question: true,
  category: true,
  createdBy: true,
  createdDate: true
});

// Relations
export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  reviewer: one(users, {
    fields: [candidates.reviewedBy],
    references: [users.id]
  }),
  school: one(schools, {
    fields: [candidates.schoolId],
    references: [schools.id]
  }),
  interviewQuestions: many(interviewQuestions)
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one }) => ({
  candidate: one(candidates, {
    fields: [interviewQuestions.candidateId],
    references: [candidates.id]
  }),
  creator: one(users, {
    fields: [interviewQuestions.createdBy],
    references: [users.id]
  })
}));

// Define comprehensive school relations
export const schoolsRelations = relations(schools, ({ many }) => ({
  instructors: many(instructors),
  courses: many(courses),
  students: many(students),
  documents: many(documents),
  events: many(events),
  candidates: many(candidates),
  staffCounseling: many(staffCounseling),
}));

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;
