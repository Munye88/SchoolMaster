import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { schools } from "./schema";

export const testScores = pgTable("test_scores", {
  id: serial("id").primaryKey(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  testType: varchar("test_type", { length: 50 }).notNull(), // ALCPT, Book Test, ECL, OPI
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  percentage: integer("percentage").notNull(),
  testDate: timestamp("test_date").notNull(),
  instructor: varchar("instructor", { length: 255 }).notNull(),
  course: varchar("course", { length: 255 }).notNull(),
  level: varchar("level", { length: 100 }).notNull(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const testScoresRelations = relations(testScores, ({ one }) => ({
  school: one(schools, { fields: [testScores.schoolId], references: [schools.id] })
}));

export const insertTestScoreSchema = createInsertSchema(testScores).omit({
  id: true,
  uploadDate: true,
  createdAt: true,
  updatedAt: true
});

export type TestScore = typeof testScores.$inferSelect;
export type InsertTestScore = typeof testScores.$inferInsert;