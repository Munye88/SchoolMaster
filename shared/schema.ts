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
  email: text("email"),
  dateOfBirth: date("date_of_birth"),
  passportNumber: text("passport_number"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  contractEndDate: date("contract_end_date"),
  salary: integer("salary"),
  department: text("department"),
  status: text("status").default("Active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  employmentStatus: text("employment_status").default("active"),
  hireDate: date("hire_date"),
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
  dateOfBirth: true,
  emergencyContact: true,
  emergencyPhone: true,
  contractEndDate: true,
  department: true,
  status: true,
  notes: true,
  employmentStatus: true,
  hireDate: true,
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
  evaluatorId: integer("evaluator_id").references(() => users.id),
  evaluationDate: text("evaluation_date").notNull(),
  overallRating: integer("overall_rating").notNull(),
  teachingEffectiveness: integer("teaching_effectiveness").notNull(),
  classroomManagement: integer("classroom_management").notNull(),
  professionalDevelopment: integer("professional_development").notNull(),
  communication: integer("communication").notNull(),
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  comments: text("comments"),
  status: text("status").notNull().default("draft"),
  followUpDate: text("follow_up_date"),
  completionDate: text("completion_date"),
  evaluationType: text("evaluation_type").notNull().default("quarterly"),
  quarter: text("quarter"),
  year: text("year").notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  attachmentUrl: text("attachment_url"),
  employeeId: text("employee_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEvaluationSchema = createInsertSchema(evaluations).pick({
  instructorId: true,
  evaluatorId: true,
  evaluationDate: true,
  overallRating: true,
  teachingEffectiveness: true,
  classroomManagement: true,
  professionalDevelopment: true,
  communication: true,
  strengths: true,
  areasForImprovement: true,
  comments: true,
  status: true,
  followUpDate: true,
  completionDate: true,
  evaluationType: true,
  quarter: true,
  year: true,
  score: true,
  feedback: true,
  attachmentUrl: true,
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
    enum: ["present", "absent", "late", "sick", "paternity", "pto", "bereavement", "marriage", "holiday"] 
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

// PTO Balance Tracker
export const ptoBalance = pgTable("pto_balance", {
  id: serial("id").primaryKey(),
  instructorId: integer("instructor_id").notNull().references(() => instructors.id),
  year: integer("year").notNull(),
  totalDays: integer("total_days").notNull().default(21), // Default annual PTO allowance
  usedDays: integer("used_days").notNull().default(0),
  remainingDays: integer("remaining_days").notNull().default(21), // Initially equal to totalDays
  adjustments: integer("adjustments").default(0), // For manual adjustments as needed
  manualEntry: boolean("manual_entry").default(false), // Flag to indicate manually set PTO allocations
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertPtoBalanceSchema = createInsertSchema(ptoBalance).pick({
  instructorId: true,
  year: true,
  totalDays: true, 
  usedDays: true,
  remainingDays: true,
  adjustments: true
});

export const ptoBalanceRelations = relations(ptoBalance, ({ one }) => ({
  instructor: one(instructors, {
    fields: [ptoBalance.instructorId],
    references: [instructors.id]
  })
}));

export type PtoBalance = typeof ptoBalance.$inferSelect;
export type InsertPtoBalance = z.infer<typeof insertPtoBalanceSchema>;

// School Documents Management
export const schoolDocuments = pgTable("school_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  documentType: text("document_type").notNull(), // 'daily_schedule', 'yearly_schedule', 'handbook', 'policy', 'other'
  schoolId: integer("school_id").notNull().references(() => schools.id),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  description: text("description"),
});

export const insertSchoolDocumentSchema = createInsertSchema(schoolDocuments).pick({
  title: true,
  fileName: true,
  fileUrl: true,
  documentType: true,
  schoolId: true,
  uploadedBy: true,
  description: true,
});

export const schoolDocumentsRelations = relations(schoolDocuments, ({ one }) => ({
  school: one(schools, {
    fields: [schoolDocuments.schoolId],
    references: [schools.id]
  }),
  uploader: one(users, {
    fields: [schoolDocuments.uploadedBy],
    references: [users.id]
  })
}));

export type SchoolDocument = typeof schoolDocuments.$inferSelect;
export type InsertSchoolDocument = z.infer<typeof insertSchoolDocumentSchema>;

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
  inventoryItems: many(inventoryItems),
  inventoryTransactions: many(inventoryTransactions),
}));

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;

// Inventory Management System
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { 
    enum: ["alcpt_form", "answer_sheet", "book", "material"] 
  }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(10), // Low stock threshold
  maxQuantity: integer("max_quantity").notNull().default(100), // High stock limit
  schoolId: integer("school_id").notNull().references(() => schools.id),
  status: text("status").notNull().default("in_stock"),
  location: text("location"), // Storage location
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  name: true,
  type: true,
  quantity: true,
  minQuantity: true,
  maxQuantity: true,
  schoolId: true,
  status: true,
  location: true,
  description: true,
  updatedAt: true
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => inventoryItems.id),
  transactionType: text("transaction_type", { 
    enum: ["received", "distributed", "adjustment", "lost", "damaged"] 
  }).notNull(),
  quantity: integer("quantity").notNull(), // Positive for additions, negative for subtractions
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  notes: text("notes"),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  schoolId: integer("school_id").notNull().references(() => schools.id)
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).pick({
  itemId: true,
  transactionType: true,
  quantity: true,
  previousQuantity: true,
  newQuantity: true,
  notes: true,
  transactionDate: true,
  createdBy: true,
  schoolId: true
});

// Relations
export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  school: one(schools, {
    fields: [inventoryItems.schoolId],
    references: [schools.id]
  }),
  transactions: many(inventoryTransactions)
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  item: one(inventoryItems, {
    fields: [inventoryTransactions.itemId],
    references: [inventoryItems.id]
  }),
  school: one(schools, {
    fields: [inventoryTransactions.schoolId],
    references: [schools.id]
  }),
  creator: one(users, {
    fields: [inventoryTransactions.createdBy],
    references: [users.id]
  })
}));

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;

// School Schedule Management System
export const schoolSchedules = pgTable("school_schedules", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  scheduleType: text("schedule_type", { 
    enum: ["yearly", "timetable", "student_day"] 
  }).notNull(),
  title: text("title").notNull(),
  academicYear: text("academic_year").notNull(), // e.g., "2024-2025"
  data: text("data").notNull(), // Store schedule data as JSON string
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertSchoolScheduleSchema = createInsertSchema(schoolSchedules).pick({
  schoolId: true,
  scheduleType: true,
  title: true,
  academicYear: true,
  data: true,
  isActive: true
});

export const schoolSchedulesRelations = relations(schoolSchedules, ({ one }) => ({
  school: one(schools, { fields: [schoolSchedules.schoolId], references: [schools.id] })
}));

export type SchoolSchedule = typeof schoolSchedules.$inferSelect;
export type InsertSchoolSchedule = z.infer<typeof insertSchoolScheduleSchema>;
