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
  name: text("name").notNull(),
  rank: text("rank"),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  enrollmentDate: date("enrollment_date").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  rank: true,
  schoolId: true,
  enrollmentDate: true,
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

// Relations
export const schoolsRelations = relations(schools, ({ many }) => ({
  instructors: many(instructors),
  courses: many(courses),
  students: many(students),
  documents: many(documents),
  events: many(events),
}));

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
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  returnDate: date("return_date").notNull(),
  ptodays: integer("pto_days").notNull(),
  rrdays: integer("rr_days").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull(), // e.g., "pending", "approved", "completed"
  comments: text("comments"),
  approvedBy: integer("approved_by").references(() => users.id)
});

export const insertStaffLeaveSchema = createInsertSchema(staffLeave).pick({
  instructorId: true,
  startDate: true,
  endDate: true,
  returnDate: true,
  ptodays: true,
  rrdays: true,
  destination: true,
  status: true,
  comments: true,
  approvedBy: true
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
