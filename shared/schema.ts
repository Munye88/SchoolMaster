import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  schoolId: integer("school_id").notNull(),
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
  instructorId: integer("instructor_id").notNull(),
  schoolId: integer("school_id").notNull(),
  status: text("status").notNull(),
  progress: integer("progress").notNull(),
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
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rank: text("rank"),
  schoolId: integer("school_id").notNull(),
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
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
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
  instructorId: integer("instructor_id").notNull(),
  quarter: text("quarter").notNull(),
  year: text("year").notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  evaluatorId: integer("evaluator_id"),
});

export const insertEvaluationSchema = createInsertSchema(evaluations).pick({
  instructorId: true,
  quarter: true,
  year: true,
  score: true,
  feedback: true,
  evaluatorId: true,
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  schoolId: integer("school_id"),
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
  userId: integer("user_id"),
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
  schoolId: integer("school_id"),
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
