import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { z } from "zod";
import fs from "fs";
import path from "path";
import multer from "multer";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  insertInstructorSchema, 
  insertCourseSchema, 
  insertActivitySchema, 
  insertEventSchema,
  insertSchoolSchema,
  insertStudentSchema,
  insertTestResultSchema,
  insertEvaluationSchema,
  insertDocumentSchema,
  insertStaffAttendanceSchema,
  insertStaffLeaveSchema,
  insertActionLogSchema,
  insertCandidateSchema,
  insertInterviewQuestionSchema,
  evaluations,
  courses,
  staffLeave,
  instructors,
  actionLogs,
  candidates,
  interviewQuestions,
  staffAttendance
} from "@shared/schema";
import { setupAuth } from "./auth";
import { generateAIResponse } from "./services/ai";
import { AIChatRequest } from "../client/src/lib/ai-types";
import { initDatabase } from "./initDb";

// Helper function to get a default instructor ID for a school
async function getDefaultInstructorId(schoolId: number): Promise<number> {
  try {
    // Get instructors from the specified school
    const instructors = await dbStorage.getInstructorsBySchool(schoolId);
    if (instructors && instructors.length > 0) {
      return instructors[0].id;
    }
    
    // Fallback: Get any instructor
    const allInstructors = await dbStorage.getInstructors();
    if (allInstructors && allInstructors.length > 0) {
      return allInstructors[0].id;
    }
    
    // Last resort: Return a fixed ID
    return 6876; // Default instructor ID
  } catch (error) {
    console.error("Error getting default instructor:", error);
    return 6876; // Fallback ID
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database
  await initDatabase();
  
  // Set up authentication
  setupAuth(app);
  
  // File upload directory setup
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(uploadDir));
  
  // Serve documents from public/documents directory
  const documentsDir = path.join(process.cwd(), 'public/documents');
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
  app.use('/documents', express.static(documentsDir));
  
  // Configure multer storage to use memory storage for better control
  // This allows us to handle the file data in memory and write it where we want
  const memoryStorage = multer.memoryStorage();
  const upload = multer({ 
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      // Accept PDFs, DOCs and DOCXs for resumes
      if (file.fieldname === 'resume' || file.fieldname === 'file') {
        if (
          file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          cb(null, true);
        } else {
          // Just log the error but still accept the file to avoid breaking uploads
          console.warn(`File ${file.originalname} has unsupported mimetype: ${file.mimetype}. Will attempt to process anyway.`);
          cb(null, true);
        }
      } else {
        // For other uploads, accept common file types
        cb(null, true);
      }
    }
  });
  
  // API routes - prefix all routes with /api
  
  // Schools
  app.get("/api/schools", async (req, res) => {
    const schools = await dbStorage.getSchools();
    res.json(schools);
  });
  
  app.get("/api/schools/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const school = await dbStorage.getSchool(id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    
    res.json(school);
  });
  
  app.get("/api/schools/code/:code", async (req, res) => {
    const code = req.params.code;
    const school = await dbStorage.getSchoolByCode(code);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    
    res.json(school);
  });
  
  app.post("/api/schools", async (req, res) => {
    try {
      const schoolData = insertSchoolSchema.parse(req.body);
      const school = await dbStorage.createSchool(schoolData);
      
      // Log activity
      await dbStorage.createActivity({
        type: "school_added",
        description: `New school "${school.name}" added`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(school);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid school data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create school" });
    }
  });
  
  app.patch("/api/schools/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    try {
      const updateData = insertSchoolSchema.partial().parse(req.body);
      const updatedSchool = await dbStorage.updateSchool(id, updateData);
      
      if (!updatedSchool) {
        return res.status(404).json({ message: "School not found" });
      }
      
      // Log activity
      await dbStorage.createActivity({
        type: "school_updated",
        description: `School "${updatedSchool.name}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedSchool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid school data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update school" });
    }
  });
  
  app.delete("/api/schools/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    try {
      // Get the school before deleting it for the activity log
      const school = await dbStorage.getSchool(id);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      
      await dbStorage.deleteSchool(id);
      
      // Log activity
      await dbStorage.createActivity({
        type: "school_deleted",
        description: `School "${school.name}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete school" });
    }
  });
  
  // Instructors
  app.get("/api/instructors", async (req, res) => {
    const instructors = await dbStorage.getInstructors();
    res.json(instructors);
  });
  
  app.get("/api/instructors/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    const instructor = await dbStorage.getInstructor(id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    
    res.json(instructor);
  });
  
  app.get("/api/schools/:schoolId/instructors", async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const instructors = await dbStorage.getInstructorsBySchool(schoolId);
    res.json(instructors);
  });
  
  app.post("/api/instructors", async (req, res) => {
    try {
      console.log("🚀 POST /api/instructors - Request body:", req.body);
      
      // Check for fields mismatch
      const { status, position, ...rest } = req.body;
      const processedData = {
        ...rest,
        accompaniedStatus: status, // Map from 'status' to 'accompaniedStatus'
        role: position, // Map from 'position' to 'role'
      };
      
      console.log("🚀 Processed data before schema validation:", processedData);
      
      const instructorData = insertInstructorSchema.parse(processedData);
      console.log("🚀 Validated instructor data:", instructorData);
      
      const instructor = await dbStorage.createInstructor(instructorData);
      console.log("🚀 Created instructor:", instructor);
      
      // Log activity
      await dbStorage.createActivity({
        type: "instructor_added",
        description: `New instructor "${instructor.name}" added`,
        timestamp: new Date(),
        userId: 1 // Hardcoded for now
      });
      
      res.status(201).json(instructor);
    } catch (error) {
      console.error("❌ Error creating instructor:", error);
      if (error instanceof z.ZodError) {
        console.error("❌ Zod validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid instructor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create instructor", error: error.message });
    }
  });
  
  app.patch("/api/instructors/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    try {
      console.log("🚀 PATCH /api/instructors/:id - Request body: ", 
        req.body.imageUrl ? 
          `Contains imageUrl (length: ${req.body.imageUrl?.length || 0} chars)` : 
          "No imageUrl provided");
      
      // Check for fields mismatch
      const { status, position, ...rest } = req.body;
      const processedData = {
        ...rest,
        ...(status && { accompaniedStatus: status }), // Only add if status exists
        ...(position && { role: position }) // Only add if position exists
      };
      
      // Handle image URL specifically - log details
      if (processedData.imageUrl) {
        const imgLength = processedData.imageUrl.length;
        console.log(`📸 Image data received: ${imgLength.toLocaleString()} chars, starts with: ${processedData.imageUrl.substring(0, 50)}...`);
        
        // Keep base64 images exactly as provided - no special handling needed
        // They'll be stored in the database directly which is fine for this application
      }
      
      console.log("🚀 Processed data before schema validation:", {
        ...processedData,
        imageUrl: processedData.imageUrl ? `[BASE64 data - ${processedData.imageUrl.length.toLocaleString()} chars]` : null
      });
      
      const updateData = insertInstructorSchema.partial().parse(processedData);
      console.log("🚀 Validated update data:", {
        ...updateData,
        imageUrl: updateData.imageUrl ? `[BASE64 data - ${updateData.imageUrl.length.toLocaleString()} chars]` : null
      });
      
      const updatedInstructor = await dbStorage.updateInstructor(id, updateData);
      console.log("🚀 Updated instructor:", {
        ...updatedInstructor,
        imageUrl: updatedInstructor.imageUrl ? `[Image data present - ${updatedInstructor.imageUrl.length.toLocaleString()} chars]` : null
      });
      
      if (!updatedInstructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      
      // Log activity
      await dbStorage.createActivity({
        type: "instructor_updated",
        description: `Instructor "${updatedInstructor.name}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedInstructor);
    } catch (error) {
      console.error("❌ Error updating instructor:", error);
      if (error instanceof z.ZodError) {
        console.error("❌ Zod validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid instructor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update instructor", error: error.message });
    }
  });
  
  app.delete("/api/instructors/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    try {
      // Get the instructor before deleting for the activity log
      const instructor = await dbStorage.getInstructor(id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      
      // 1. Delete all staff attendance records for this instructor
      const staffAttendanceRecords = await dbStorage.getStaffAttendanceByInstructor(id);
      for (const record of staffAttendanceRecords) {
        await dbStorage.deleteStaffAttendance(record.id);
      }
      
      // 2. Delete all evaluations for this instructor
      const instructorEvaluations = await dbStorage.getEvaluationsByInstructor(id);
      for (const evaluation of instructorEvaluations) {
        await db.delete(evaluations).where(eq(evaluations.id, evaluation.id));
      }
      
      // 3. Update courses to remove instructor reference
      const instructorCourses = await dbStorage.getCoursesByInstructor(id);
      for (const course of instructorCourses) {
        const courseToUpdate = await dbStorage.getCourse(course.id);
        if (courseToUpdate) {
          await dbStorage.updateCourse(course.id, { 
            ...courseToUpdate,
            instructorId: 0 // Use 0 as a placeholder value since null is causing issues
          });
        }
      }
      
      // 4. Now delete the instructor
      await dbStorage.deleteInstructor(id);
      
      // Log activity
      await dbStorage.createActivity({
        type: "instructor_deleted",
        description: `Instructor "${instructor.name}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting instructor:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Failed to delete instructor", error: errorMessage });
    }
  });
  
  // Courses
  app.get("/api/courses", async (req, res) => {
    const courses = await dbStorage.getCourses();
    res.json(courses);
  });
  
  app.get("/api/courses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    
    const course = await dbStorage.getCourse(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json(course);
  });
  
  app.get("/api/schools/:schoolId/courses", async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const courses = await dbStorage.getCoursesBySchool(schoolId);
    res.json(courses);
  });
  
  app.get("/api/instructors/:instructorId/courses", async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
    if (isNaN(instructorId)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    const courses = await dbStorage.getCoursesByInstructor(instructorId);
    res.json(courses);
  });
  
  app.post("/api/courses", async (req, res) => {
    try {
      console.log("Creating course with data:", req.body);
      
      // Make sure we have a schoolId
      if (!req.body.schoolId) {
        return res.status(400).json({ message: "schoolId is required" });
      }
      
      // Get a default instructor for this school if not provided
      let instructorId = req.body.instructorId;
      if (!instructorId) {
        instructorId = await getDefaultInstructorId(req.body.schoolId);
        console.log(`Using default instructor ID: ${instructorId} for school ID: ${req.body.schoolId}`);
      }
      
      // Add instructorId to course data
      const courseData = {
        ...req.body,
        instructorId,
        // Make sure progress is set with a default if missing
        progress: req.body.progress || 0
      };
      
      console.log("Processed course data:", courseData);
      const parsedData = insertCourseSchema.parse(courseData);
      const course = await dbStorage.createCourse(parsedData);
      
      console.log("Course created successfully:", course);
      
      // Log activity
      await dbStorage.createActivity({
        type: "course_added",
        description: `New course "${course.name}" added`,
        timestamp: new Date(),
        userId: 1 // Hardcoded for now
      });
      
      res.status(201).json(course);
    } catch (error) {
      console.error("Course creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to create course", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.patch("/api/courses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    
    try {
      console.log("Updating course with ID:", id, "Data:", req.body);
      
      // Get the existing course to maintain instructorId if not provided in update
      const existingCourse = await dbStorage.getCourse(id);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // If instructorId isn't provided in the update, keep the existing one
      let updateDataRaw = { ...req.body };
      if (!updateDataRaw.instructorId && existingCourse.instructorId) {
        updateDataRaw.instructorId = existingCourse.instructorId;
      }
      
      // Parse and validate the data
      const updateData = insertCourseSchema.partial().parse(updateDataRaw);
      const updatedCourse = await dbStorage.updateCourse(id, updateData);
      
      console.log("Course updated successfully:", updatedCourse);
      
      // Log activity
      await dbStorage.createActivity({
        type: "course_updated",
        description: `Course "${updatedCourse.name}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedCourse);
    } catch (error) {
      console.error("Course update error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to update course", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.delete("/api/courses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    
    try {
      // Get the course before deleting for the activity log
      const course = await dbStorage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      await dbStorage.deleteCourse(id);
      
      // Log activity
      await dbStorage.createActivity({
        type: "course_deleted",
        description: `Course "${course.name}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });
  
  // Students
  app.get("/api/students", async (req, res) => {
    const students = await dbStorage.getStudents();
    res.json(students);
  });
  
  app.get("/api/students/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    
    const student = await dbStorage.getStudent(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json(student);
  });
  
  app.get("/api/schools/:schoolId/students", async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const students = await dbStorage.getStudentsBySchool(schoolId);
    res.json(students);
  });
  
  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await dbStorage.createStudent(studentData);
      
      // Log activity
      await dbStorage.createActivity({
        type: "student_added",
        description: `New student "${student.name}" added`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });
  
  app.patch("/api/students/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    
    try {
      const updateData = insertStudentSchema.partial().parse(req.body);
      const updatedStudent = await dbStorage.updateStudent(id, updateData);
      
      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Log activity
      await dbStorage.createActivity({
        type: "student_updated",
        description: `Student "${updatedStudent.name}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedStudent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update student" });
    }
  });
  
  app.delete("/api/students/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    
    try {
      // Get the student before deleting for the activity log
      const student = await dbStorage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      await dbStorage.deleteStudent(id);
      
      // Log activity
      await dbStorage.createActivity({
        type: "student_deleted",
        description: `Student "${student.name}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });
  
  // Test Results
  app.get("/api/test-results", async (req, res) => {
    const testResults = await dbStorage.getTestResults();
    res.json(testResults);
  });
  
  app.get("/api/test-results/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid test result ID" });
    }
    
    const testResult = await dbStorage.getTestResult(id);
    if (!testResult) {
      return res.status(404).json({ message: "Test result not found" });
    }
    
    res.json(testResult);
  });
  
  app.get("/api/students/:studentId/test-results", async (req, res) => {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    
    const testResults = await dbStorage.getTestResultsByStudent(studentId);
    res.json(testResults);
  });
  
  app.get("/api/courses/:courseId/test-results", async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    
    const testResults = await dbStorage.getTestResultsByCourse(courseId);
    res.json(testResults);
  });
  
  app.post("/api/test-results", async (req, res) => {
    try {
      const testResultData = insertTestResultSchema.parse(req.body);
      const testResult = await dbStorage.createTestResult(testResultData);
      
      // Get student name for activity log
      const student = await dbStorage.getStudent(testResult.studentId);
      const studentName = student ? student.name : `Student ID ${testResult.studentId}`;
      
      // Log activity
      await dbStorage.createActivity({
        type: "test_result_added",
        description: `New test result added for student "${studentName}"`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(testResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test result" });
    }
  });
  
  // Evaluations
  app.get("/api/evaluations", async (req, res) => {
    const evaluations = await dbStorage.getEvaluations();
    res.json(evaluations);
  });
  
  app.get("/api/evaluations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid evaluation ID" });
    }
    
    const evaluation = await dbStorage.getEvaluation(id);
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    
    res.json(evaluation);
  });
  
  app.get("/api/instructors/:instructorId/evaluations", async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
    if (isNaN(instructorId)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    const evaluations = await dbStorage.getEvaluationsByInstructor(instructorId);
    res.json(evaluations);
  });
  
  app.post("/api/evaluations", async (req, res) => {
    try {
      const evaluationData = insertEvaluationSchema.parse(req.body);
      const evaluation = await dbStorage.createEvaluation(evaluationData);
      
      // Get instructor name for activity log
      const instructor = await dbStorage.getInstructor(evaluation.instructorId);
      const instructorName = instructor ? instructor.name : `Instructor ID ${evaluation.instructorId}`;
      
      // Log activity
      await dbStorage.createActivity({
        type: "evaluation_added",
        description: `New evaluation added for instructor "${instructorName}"`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(evaluation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid evaluation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create evaluation" });
    }
  });
  
  app.patch("/api/evaluations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid evaluation ID" });
    }
    
    try {
      const updateData = insertEvaluationSchema.partial().parse(req.body);
      
      // First get the existing evaluation
      const existingEvaluation = await dbStorage.getEvaluation(id);
      if (!existingEvaluation) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      
      // Update the evaluation
      const updatedEvaluation = await db
        .update(evaluations)
        .set(updateData)
        .where(eq(evaluations.id, id))
        .returning();
        
      if (!updatedEvaluation || updatedEvaluation.length === 0) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      
      // Get instructor name for activity log
      const instructor = await dbStorage.getInstructor(existingEvaluation.instructorId);
      const instructorName = instructor ? instructor.name : `Instructor ID ${existingEvaluation.instructorId}`;
      
      // Log activity
      await dbStorage.createActivity({
        type: "evaluation_updated",
        description: `Evaluation for instructor "${instructorName}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedEvaluation[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid evaluation data", errors: error.errors });
      }
      console.error("Error updating evaluation:", error);
      res.status(500).json({ message: "Failed to update evaluation" });
    }
  });
  
  app.delete("/api/evaluations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid evaluation ID" });
    }
    
    try {
      // First get the existing evaluation
      const evaluation = await dbStorage.getEvaluation(id);
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      
      // Get instructor name for activity log
      const instructor = await dbStorage.getInstructor(evaluation.instructorId);
      const instructorName = instructor ? instructor.name : `Instructor ID ${evaluation.instructorId}`;
      
      // Delete the evaluation
      await db.delete(evaluations).where(eq(evaluations.id, id));
      
      // Log activity
      await dbStorage.createActivity({
        type: "evaluation_deleted",
        description: `Evaluation for instructor "${instructorName}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      res.status(500).json({ message: "Failed to delete evaluation" });
    }
  });
  
  // Documents
  app.get("/api/documents", async (req, res) => {
    const documents = await dbStorage.getDocuments();
    res.json(documents);
  });
  
  app.get("/api/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }
    
    const document = await dbStorage.getDocument(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.json(document);
  });
  
  app.get("/api/schools/:schoolId/documents", async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const documents = await dbStorage.getDocumentsBySchool(schoolId);
    res.json(documents);
  });
  
  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await dbStorage.createDocument(documentData);
      
      // Log activity
      await dbStorage.createActivity({
        type: "document_added",
        description: `New document "${document.title}" added`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  
  // Activities
  app.get("/api/activities/recent", async (req, res) => {
    const limit = parseInt(req.query.limit as string || '5');
    const activities = await dbStorage.getRecentActivities(limit);
    res.json(activities);
  });
  
  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await dbStorage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });
  
  // Events
  app.get("/api/events", async (req, res) => {
    const events = await dbStorage.getEvents();
    res.json(events);
  });
  
  app.get("/api/schools/:id/events", async (req, res) => {
    const schoolId = parseInt(req.params.id);
    if (isNaN(schoolId)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const events = await dbStorage.getEvents();
    const schoolEvents = events.filter(event => event.schoolId === schoolId);
    res.json(schoolEvents);
  });
  
  app.get("/api/events/upcoming", async (req, res) => {
    const limit = parseInt(req.query.limit as string || '5');
    const events = await dbStorage.getUpcomingEvents(limit);
    res.json(events);
  });
  
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await dbStorage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  app.put("/api/events/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    try {
      const eventData = insertEventSchema.parse(req.body);
      
      // Check if event exists
      const existingEvents = await db.select().from(events).where(eq(events.id, id));
      if (existingEvents.length === 0) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Update the event
      const updatedEvents = await db
        .update(events)
        .set(eventData)
        .where(eq(events.id, id))
        .returning();
      
      if (!updatedEvents || updatedEvents.length === 0) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Log activity
      await dbStorage.createActivity({
        type: "event_updated",
        description: `Event "${updatedEvents[0].title}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedEvents[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete("/api/events/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    try {
      // Check if event exists and get its title for the activity log
      const existingEvents = await db.select().from(events).where(eq(events.id, id));
      if (existingEvents.length === 0) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventTitle = existingEvents[0].title;
      
      // Delete the event
      await db.delete(events).where(eq(events.id, id));
      
      // Log activity
      await dbStorage.createActivity({
        type: "event_deleted",
        description: `Event "${eventTitle}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Get school statistics
  app.get("/api/statistics/schools", async (req, res) => {
    const schools = await dbStorage.getSchools();
    const schoolStats = await Promise.all(
      schools.map(async (school) => {
        const instructors = await dbStorage.getInstructorsBySchool(school.id);
        const courses = await dbStorage.getCoursesBySchool(school.id);
        
        // Calculate total students across all courses for this school
        const totalStudents = courses.reduce((acc, course) => acc + course.studentCount, 0);
        
        return {
          id: school.id,
          name: school.name,
          code: school.code,
          instructorCount: instructors.length,
          courseCount: courses.length,
          studentCount: totalStudents
        };
      })
    );
    
    res.json(schoolStats);
  });
  
  // Get nationality statistics
  app.get("/api/statistics/nationalities", async (req, res) => {
    const instructors = await dbStorage.getInstructors();
    
    // Count instructors by nationality
    const nationalityCounts = instructors.reduce((acc, instructor) => {
      const { nationality } = instructor;
      acc[nationality] = (acc[nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array of objects
    const nationalityStats = Object.entries(nationalityCounts).map(([nationality, count]) => ({
      nationality,
      count
    }));
    
    res.json(nationalityStats);
  });

  // AI Chatbot
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const chatRequest: AIChatRequest = req.body;
      
      // Gather context data 
      let dataContext = "";
      
      // Add school-specific context if schoolId is provided
      if (chatRequest.schoolId) {
        const school = await dbStorage.getSchool(chatRequest.schoolId);
        if (school) {
          dataContext += `Current school context: ${school.name} (${school.code})\n`;
          
          // Add additional school data
          const instructors = await dbStorage.getInstructorsBySchool(school.id);
          dataContext += `${school.name} has ${instructors.length} instructors.\n`;
          
          const courses = await dbStorage.getCoursesBySchool(school.id);
          dataContext += `${school.name} has ${courses.length} active courses.\n`;
          
          // Add test results summary if available
          const testResults = await dbStorage.getTestResults();
          if (testResults.length > 0) {
            const schoolTestResults = testResults.filter(tr => {
              // Find the course for this test result
              const course = courses.find(c => c.id === tr.courseId);
              // If course exists and belongs to the school, include this test result
              return course && course.schoolId === school.id;
            });
            
            if (schoolTestResults.length > 0) {
              // Calculate averages by test type
              const testTypes = Array.from(new Set(schoolTestResults.map(tr => tr.type)));
              testTypes.forEach(testType => {
                const typeResults = schoolTestResults.filter(tr => tr.type === testType);
                const avgScore = typeResults.reduce((sum, tr) => sum + tr.score, 0) / typeResults.length;
                dataContext += `Average ${testType} score at ${school.name}: ${avgScore.toFixed(1)}%.\n`;
              });
            }
          }
        }
      } else {
        // General context about all schools
        const schools = await dbStorage.getSchools();
        dataContext += `System manages ${schools.length} schools: ${schools.map(s => s.name).join(", ")}.\n`;
        
        // Add test results summary
        const testResults = await dbStorage.getTestResults();
        if (testResults.length > 0) {
          // Calculate averages by test type
          const testTypes = Array.from(new Set(testResults.map(tr => tr.type)));
          testTypes.forEach(testType => {
            const typeResults = testResults.filter(tr => tr.type === testType);
            const avgScore = typeResults.reduce((sum, tr) => sum + tr.score, 0) / typeResults.length;
            dataContext += `Average ${testType} score across all schools: ${avgScore.toFixed(1)}%.\n`;
          });
        }
        
        // Add instructor evaluation summary
        const evaluations = await dbStorage.getEvaluations();
        if (evaluations.length > 0) {
          const avgScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length;
          dataContext += `Average instructor evaluation score: ${avgScore.toFixed(1)}%. Passing score is 85%.\n`;
          
          const passingCount = evaluations.filter(evaluation => evaluation.score >= 85).length;
          const passRate = (passingCount / evaluations.length) * 100;
          dataContext += `${passingCount} out of ${evaluations.length} evaluations meet or exceed the passing score (${passRate.toFixed(1)}%).\n`;
        }
      }
      
      // Add the context to the request
      chatRequest.dataContext = dataContext;
      
      // Generate AI response
      const response = await generateAIResponse(chatRequest);
      
      // Log activity
      await dbStorage.createActivity({
        type: "ai_chat",
        description: `AI chat query: "${chatRequest.messages[chatRequest.messages.length - 1].content.substring(0, 50)}${chatRequest.messages[chatRequest.messages.length - 1].content.length > 50 ? '...' : ''}"`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error in AI chat endpoint:", error);
      res.status(500).json({ 
        message: {
          role: "assistant",
          content: "I'm sorry, I encountered an error while processing your request. Please try again."
        }
      });
    }
  });

  // Recruitment Module API Routes
  
  // CV upload storage configuration is shared with the existing upload configuration
  
  // Candidates
  app.get("/api/candidates", async (req, res) => {
    try {
      const schoolId = req.query.schoolId ? Number(req.query.schoolId) : undefined;
      const status = req.query.status as string | undefined;
      
      let candidates;
      if (status) {
        candidates = await dbStorage.getCandidatesByStatus(status);
      } else if (schoolId) {
        candidates = await dbStorage.getCandidatesBySchool(schoolId);
      } else {
        candidates = await dbStorage.getCandidates();
      }
      
      res.json(candidates);
    } catch (error) {
      console.error("Error getting candidates:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });
  
  // Parse resume with enhanced text analysis (no AI APIs required)
  app.post("/api/candidates/parse-resume", upload.single('resume'), async (req, res) => {
    try {
      console.log("Resume parsing request received");
      
      // Check if file was properly uploaded
      if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
        console.log("File is missing or empty");
        return res.status(400).json({ 
          error: "No valid file uploaded", 
          resumeUrl: null,
          name: null,
          email: null,
          phone: null,
          status: "new",
          aiProvider: "None (no file)"
        });
      }
      
      console.log(`File uploaded: ${req.file.originalname}, mimetype: ${req.file.mimetype}, size: ${req.file.size} bytes`);
      
      // Create dedicated directory for resumes
      const dirPath = path.join("uploads", "resumes");
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created resumes directory: ${dirPath}`);
      }
      
      // Create a unique filename
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(dirPath, fileName);
      
      // Write the buffer to disk
      try {
        fs.writeFileSync(filePath, req.file.buffer);
        console.log(`File saved to: ${filePath}`);
      } catch (writeError) {
        console.error("Error writing file to disk:", writeError);
        // We'll continue anyway and try to extract info from the buffer
      }
      
      // Generate a URL for the uploaded file (relative path)
      const fileUrl = `/uploads/resumes/${fileName}`;
      console.log(`File URL (for frontend): ${fileUrl}`);
      
      // Default candidate info with file URL
      let candidateInfo: any = {
        status: "new",
        resumeUrl: fileUrl
      };
      
      try {
        // Skip external API calls and use our enhanced text extraction directly
        const { extractTextFromFile, extractCandidateInfoFromText } = await import('./utils/textAnalyzer');
        
        // Extract text from file
        console.log("Extracting text from file...");
        const resumeText = await extractTextFromFile(filePath);
        
        if (!resumeText || resumeText.trim() === '') {
          console.log("No text could be extracted from the file");
          return res.status(200).json({
            ...candidateInfo,
            aiProvider: "Text Extraction Failed"
          });
        }
        
        console.log(`Successfully extracted ${resumeText.length} characters of text from file`);
        
        // Extract candidate info using our enhanced text pattern analysis
        const extractedInfo = await extractCandidateInfoFromText(resumeText, filePath);
        
        candidateInfo = {
          ...extractedInfo,
          resumeUrl: fileUrl
        };
        
        // Return the extracted info with our analyzer as the provider
        return res.status(200).json({
          ...candidateInfo,
          resumeUrl: fileUrl,
          aiProvider: "Enhanced Pattern Analyzer"
        });
      } catch (error) {
        console.error("Error in text analysis:", error);
        
        // Basic fallback if our primary text analyzer fails
        try {
          // Read text from file directly
          let resumeText = "";
          try {
            resumeText = fs.readFileSync(filePath, 'utf8');
          } catch (readError) {
            console.error("Failed to read file directly:", readError);
          }
          
          if (resumeText) {
            // Very basic extraction as last resort
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
            const phoneRegex = /(?:\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g;
            const nameRegex = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g;
            
            const emails = resumeText.match(emailRegex) || [];
            const phones = resumeText.match(phoneRegex) || [];
            const names = resumeText.match(nameRegex) || [];
            
            candidateInfo = {
              ...candidateInfo,
              email: emails.length > 0 ? emails[0] : undefined,
              phone: phones.length > 0 ? phones[0] : undefined,
              name: names.length > 0 ? names[0] : undefined,
              status: "new"
            };
          }
        } catch (fallbackError) {
          console.error("Even basic fallback extraction failed:", fallbackError);
        }
        
        // Return whatever we could extract
        return res.status(200).json({
          ...candidateInfo,
          resumeUrl: fileUrl,
          aiProvider: "Basic Fallback Analysis"
        });
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
      return res.status(500).json({ 
        error: "Failed to parse resume",
        status: "new",
        resumeUrl: req.file ? `/uploads/resumes/${Date.now()}-${req.file.originalname}` : null
      });
    }
  });
  
  // Rank candidates based on criteria
  app.get("/api/candidates/rank-candidates", async (req, res) => {
    try {
      // Get all candidates
      const candidates = await dbStorage.getCandidates();
      
      if (candidates.length === 0) {
        return res.status(200).json({ 
          rankedCandidates: [],
          rationale: "No candidates available to rank."
        });
      }
      
      // Use pattern-based ranking algorithm instead of external AI
      console.log("Ranking candidates using internal scoring algorithm...");
      
      // Score candidates based on education, experience, certifications, and other criteria
      const rankedCandidates = candidates.map(candidate => {
        // Start with a base score
        let score = 50;
        
        // Add points for degree level
        if (candidate.degree) {
          if (candidate.degree.includes('PhD') || candidate.degree.includes('Doctorate')) {
            score += 15;
          } else if (candidate.degree.includes('Master')) {
            score += 10;
          } else if (candidate.degree.includes('Bachelor')) {
            score += 5;
          }
        }
        
        // Add points for relevant degree field
        if (candidate.degreeField) {
          const field = candidate.degreeField.toLowerCase();
          if (field.includes('english') || field.includes('linguistics') || field.includes('language')) {
            score += 10;
          } else if (field.includes('education') || field.includes('teaching')) {
            score += 8;
          } else if (field.includes('literature')) {
            score += 6;
          }
        }
        
        // Add points for years of experience
        if (candidate.yearsExperience) {
          if (candidate.yearsExperience >= 10) {
            score += 15;
          } else if (candidate.yearsExperience >= 5) {
            score += 10;
          } else if (candidate.yearsExperience >= 2) {
            score += 5;
          } else {
            score += 2;
          }
        }
        
        // Add points for certifications
        if (candidate.hasCertifications) {
          score += 10;
        }
        
        // Add points for native English speaker
        if (candidate.nativeEnglishSpeaker) {
          score += 8;
        }
        
        // Add points for military experience (relevant for this specific program)
        if (candidate.militaryExperience) {
          score += 7;
        }
        
        // Return candidate with score
        return {
          ...candidate,
          score
        };
      });
      
      // Sort by score (descending)
      rankedCandidates.sort((a, b) => b.score - a.score);
      
      // Get top 10 candidates
      const top10Candidates = rankedCandidates.slice(0, 10);
      
      // Generate rationale for ranking
      const rationale = `Candidates were ranked based on a scoring system that evaluates their education level (degree type and field of study), years of experience, professional certifications, English language proficiency, and relevant military experience. The top candidates demonstrate strong credentials in English language teaching with appropriate qualifications.`;
      
      res.status(200).json({
        rankedCandidates: top10Candidates,
        rationale
      });
    } catch (error) {
      console.error("Error ranking candidates:", error);
      res.status(500).json({ error: "Failed to rank candidates" });
    }
  });
  
  app.get("/api/schools/:schoolId/candidates", async (req, res) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      if (isNaN(schoolId)) {
        return res.status(400).json({ message: "Invalid school ID" });
      }
      
      const candidates = await dbStorage.getCandidatesBySchool(schoolId);
      res.json(candidates);
    } catch (error) {
      console.error("Error getting candidates for school:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });
  
  app.get("/api/candidates/status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      const candidates = await dbStorage.getCandidatesByStatus(status);
      res.json(candidates);
    } catch (error) {
      console.error("Error getting candidates by status:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });
  
  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const candidateId = Number(req.params.id);
      if (isNaN(candidateId)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }
      
      const candidate = await dbStorage.getCandidate(candidateId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error getting candidate:", error);
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });
  
  app.post("/api/candidates", upload.single('resume'), async (req, res) => {
    try {
      let resumeUrl = null;
      let candidateData;
      
      // Handle different formats of form data
      if (req.body.candidateData) {
        // JSON format from multipart form
        candidateData = JSON.parse(req.body.candidateData);
      } else {
        // Regular form data
        candidateData = req.body;
      }
      
      // Handle file upload
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const dirPath = path.join("uploads", "resumes");
        const filePath = path.join(dirPath, fileName);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Write file to disk
        fs.writeFileSync(filePath, req.file.buffer);
        resumeUrl = `/uploads/resumes/${fileName}`;
      }
      
      // Prepare candidate data with file path
      const finalCandidateData = {
        ...candidateData,
        resumeUrl: resumeUrl || candidateData.resumeUrl,
        status: candidateData.status || "new",
        uploadDate: new Date(),
      };
      
      const parsedData = insertCandidateSchema.parse(finalCandidateData);
      const candidate = await dbStorage.createCandidate(parsedData);
      
      // Log activity
      await dbStorage.createActivity({
        type: "candidate_added",
        description: `New candidate "${candidate.name}" added`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create candidate", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  app.patch("/api/candidates/:id", upload.single('resume'), async (req, res) => {
    try {
      const candidateId = Number(req.params.id);
      if (isNaN(candidateId)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }
      
      let resumeUrl = null;
      let updateData;
      
      // Handle different formats of form data
      if (req.body.candidateData) {
        // JSON format from multipart form
        updateData = JSON.parse(req.body.candidateData);
      } else {
        // Regular form data
        updateData = req.body;
      }
      
      // If file was uploaded, get the file path
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const dirPath = path.join("uploads", "resumes");
        const filePath = path.join(dirPath, fileName);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Write file to disk
        fs.writeFileSync(filePath, req.file.buffer);
        resumeUrl = `/uploads/resumes/${fileName}`;
        
        // Add resumeUrl to update data
        updateData = {
          ...updateData,
          resumeUrl
        };
      }
      
      const parsedData = insertCandidateSchema.partial().parse(updateData);
      const updatedCandidate = await dbStorage.updateCandidate(candidateId, parsedData);
      
      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Log activity
      await dbStorage.createActivity({
        type: "candidate_updated",
        description: `Candidate "${updatedCandidate.name}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedCandidate);
    } catch (error) {
      console.error("Error updating candidate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update candidate", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const candidateId = Number(req.params.id);
      if (isNaN(candidateId)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }
      
      // Get the candidate before deleting for the activity log
      const candidate = await dbStorage.getCandidate(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Delete related interview questions first
      const questions = await dbStorage.getInterviewQuestionsByCandidate(candidateId);
      for (const question of questions) {
        await dbStorage.deleteInterviewQuestion(question.id);
      }
      
      // Now delete the candidate
      await dbStorage.deleteCandidate(candidateId);
      
      // Log activity
      await dbStorage.createActivity({
        type: "candidate_deleted",
        description: `Candidate "${candidate.name}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      res.status(500).json({ message: "Failed to delete candidate", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Interview Questions
  app.get("/api/interview-questions", async (req, res) => {
    try {
      const candidateId = req.query.candidateId ? Number(req.query.candidateId) : undefined;
      const questions = candidateId 
        ? await dbStorage.getInterviewQuestionsByCandidate(candidateId)
        : await dbStorage.getInterviewQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error getting interview questions:", error);
      res.status(500).json({ error: "Failed to fetch interview questions" });
    }
  });
  
  app.get("/api/candidates/:candidateId/interview-questions", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }
      
      const questions = await dbStorage.getInterviewQuestionsByCandidate(candidateId);
      res.json(questions);
    } catch (error) {
      console.error("Error getting interview questions for candidate:", error);
      res.status(500).json({ error: "Failed to fetch interview questions" });
    }
  });
  
  app.get("/api/interview-questions/:id", async (req, res) => {
    try {
      const questionId = Number(req.params.id);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const question = await dbStorage.getInterviewQuestion(questionId);
      if (!question) {
        return res.status(404).json({ error: "Interview question not found" });
      }
      res.json(question);
    } catch (error) {
      console.error("Error getting interview question:", error);
      res.status(500).json({ error: "Failed to fetch interview question" });
    }
  });
  
  app.post("/api/interview-questions", async (req, res) => {
    try {
      const questionData = insertInterviewQuestionSchema.parse({
        ...req.body,
        createdDate: new Date(),
        createdBy: req.isAuthenticated() ? req.user.id : null
      });
      
      const question = await dbStorage.createInterviewQuestion(questionData);
      
      // Log activity
      await dbStorage.createActivity({
        type: "question_added",
        description: `New interview question added for candidate ID ${question.candidateId}`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating interview question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create interview question", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  app.patch("/api/interview-questions/:id", async (req, res) => {
    try {
      const questionId = Number(req.params.id);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const updateData = insertInterviewQuestionSchema.partial().parse(req.body);
      const updatedQuestion = await dbStorage.updateInterviewQuestion(questionId, updateData);
      
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Log activity
      await dbStorage.createActivity({
        type: "question_updated",
        description: `Interview question updated for candidate ID ${updatedQuestion.candidateId}`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating interview question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update interview question", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  app.delete("/api/interview-questions/:id", async (req, res) => {
    try {
      const questionId = Number(req.params.id);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      // Get the question before deleting for the activity log
      const question = await dbStorage.getInterviewQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      await dbStorage.deleteInterviewQuestion(questionId);
      
      // Log activity
      await dbStorage.createActivity({
        type: "question_deleted",
        description: `Interview question deleted for candidate ID ${question.candidateId}`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting interview question:", error);
      res.status(500).json({ message: "Failed to delete interview question", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Staff Attendance
  app.get("/api/staff-attendance", async (req, res) => {
    try {
      // Check for query parameters
      const { date, schoolId, instructorId } = req.query;
      
      if (instructorId) {
        // Get attendance for a specific instructor
        const instructorIdNum = parseInt(instructorId as string);
        if (isNaN(instructorIdNum)) {
          return res.status(400).json({ message: "Invalid instructor ID" });
        }
        const attendance = await dbStorage.getStaffAttendanceByInstructor(instructorIdNum);
        return res.json(attendance);
      } 
      
      if (date && schoolId) {
        // Filter by date and school
        const schoolIdNum = parseInt(schoolId as string);
        if (isNaN(schoolIdNum)) {
          return res.status(400).json({ message: "Invalid school ID" });
        }
        
        // Get all attendance records
        const allAttendance = await dbStorage.getAllStaffAttendance();
        
        // Get all instructors from the specified school
        const schoolInstructors = await dbStorage.getInstructorsBySchool(schoolIdNum);
        const instructorIds = schoolInstructors.map(instructor => instructor.id);
        
        console.log(`Filtering attendance records for date: ${date}, schoolId: ${schoolId}, found ${instructorIds.length} instructors for school`);
        
        // First normalize the date string to handle both formats
        const dateStr = date as string;
        
        // Filter attendance records
        const filteredAttendance = allAttendance.filter(record => {
          // Normalize record date by extracting only the date part if it contains time
          const recordDate = record.date.includes('T') ? 
            record.date.split('T')[0] : 
            record.date;
            
          // For exact date match, check if dates are equal
          const isDateMatch = (dateStr.length === 10) ? 
            recordDate === dateStr : // Full date match (YYYY-MM-DD)
            recordDate.startsWith(dateStr); // Partial match (YYYY-MM)
            
          const isSchoolMatch = instructorIds.includes(record.instructorId);
          
          return isDateMatch && isSchoolMatch;
        });
        
        console.log(`Returning ${filteredAttendance.length} attendance records after filtering by date and school`);
        return res.json(filteredAttendance);
      }
      
      if (date) {
        // Filter by date only
        console.log(`Filtering attendance records for date: ${date} (without schoolId)`);
        
        // Get all attendance records
        const allAttendance = await dbStorage.getAllStaffAttendance();
        
        // First normalize the date string
        const dateStr = date as string;
        
        // Filter attendance records by date
        const filteredAttendance = allAttendance.filter(record => {
          // Normalize record date by extracting only the date part if it contains time
          const recordDate = record.date.includes('T') ? 
            record.date.split('T')[0] : 
            record.date;
            
          // For exact date match, check if dates are equal
          const isDateMatch = (dateStr.length === 10) ? 
            recordDate === dateStr : // Full date match (YYYY-MM-DD)
            recordDate.startsWith(dateStr); // Partial match (YYYY-MM)
            
          return isDateMatch;
        });
        
        console.log(`Returning ${filteredAttendance.length} attendance records matching date: ${date}`);
        return res.json(filteredAttendance);
      }
      
      // Get all records if no specific filters
      const attendance = await dbStorage.getAllStaffAttendance();
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching staff attendance:", error);
      res.status(500).json({ message: "Failed to fetch staff attendance" });
    }
  });
  
  app.get("/api/staff-attendance/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance record ID" });
    }
    
    const attendance = await dbStorage.getStaffAttendance(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    
    res.json(attendance);
  });
  
  app.post("/api/staff-attendance", async (req, res) => {
    try {
      const attendanceData = insertStaffAttendanceSchema.parse(req.body);
      const attendance = await dbStorage.createStaffAttendance(attendanceData);
      
      // Log activity
      const instructor = await dbStorage.getInstructor(attendance.instructorId);
      await dbStorage.createActivity({
        type: "attendance_recorded",
        description: `Attendance for "${instructor?.name || 'Instructor'}" recorded as ${attendance.status}`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });
  
  app.put("/api/staff-attendance/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance record ID" });
    }
    
    try {
      // Get the current record to verify it exists
      const existingRecord = await dbStorage.getStaffAttendance(id);
      
      if (!existingRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Process the update data
      const updateData = {
        status: req.body.status,
        timeIn: req.body.timeIn || null,
        timeOut: req.body.timeOut || null,
        comments: req.body.comments || null,
      };
      
      // Update the record
      const updatedAttendance = await dbStorage.updateStaffAttendance(id, updateData);
      
      // Log activity
      const instructor = await dbStorage.getInstructor(existingRecord.instructorId);
      await dbStorage.createActivity({
        type: "attendance_updated",
        description: `Attendance for "${instructor?.name || 'Instructor'}" updated to ${updateData.status}`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedAttendance);
    } catch (error) {
      console.error("Error updating attendance record:", error);
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });
  
  app.patch("/api/staff-attendance/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance record ID" });
    }
    
    try {
      const updateData = insertStaffAttendanceSchema.partial().parse(req.body);
      const updatedAttendance = await dbStorage.updateStaffAttendance(id, updateData);
      
      if (!updatedAttendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Log activity
      const instructor = await dbStorage.getInstructor(updatedAttendance.instructorId);
      await dbStorage.createActivity({
        type: "attendance_updated",
        description: `Attendance for "${instructor?.name || 'Instructor'}" updated to ${updatedAttendance.status}`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedAttendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });
  
  app.delete("/api/staff-attendance/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance record ID" });
    }
    
    try {
      // Get the attendance record before deleting for the activity log
      const attendance = await dbStorage.getStaffAttendance(id);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      const instructor = await dbStorage.getInstructor(attendance.instructorId);
      await dbStorage.deleteStaffAttendance(id);
      
      // Log activity
      await dbStorage.createActivity({
        type: "attendance_deleted",
        description: `Attendance record for "${instructor?.name || 'Instructor'}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attendance record" });
    }
  });
  
  // Staff leave routes
  app.get("/api/staff-leave", async (req, res) => {
    try {
      // Join with instructors to get instructor names
      const leaveRecords = await db
        .select({
          id: staffLeave.id,
          instructorId: staffLeave.instructorId,
          instructorName: instructors.name,
          startDate: staffLeave.startDate,
          endDate: staffLeave.endDate,
          returnDate: staffLeave.returnDate,
          ptodays: staffLeave.ptodays,
          rrdays: staffLeave.rrdays,
          destination: staffLeave.destination,
          status: staffLeave.status,
          comments: staffLeave.comments,
          approvedBy: staffLeave.approvedBy,
          leaveType: staffLeave.leaveType,
          schoolId: instructors.schoolId
        })
        .from(staffLeave)
        .innerJoin(instructors, eq(staffLeave.instructorId, instructors.id));
      
      res.json(leaveRecords);
    } catch (error) {
      console.error("Error fetching staff leave records:", error);
      res.status(500).json({ error: "Failed to fetch staff leave records" });
    }
  });

  app.post("/api/staff-leave", async (req, res) => {
    try {
      const newLeave = req.body;
      const [leave] = await db.insert(staffLeave).values(newLeave).returning();
      res.status(201).json(leave);
    } catch (error) {
      console.error("Error creating staff leave record:", error);
      res.status(500).json({ error: "Failed to create staff leave record" });
    }
  });
  
  app.patch("/api/staff-leave/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid staff leave ID" });
    }
    
    try {
      const updateData = req.body;
      const [updatedLeave] = await db
        .update(staffLeave)
        .set(updateData)
        .where(eq(staffLeave.id, id))
        .returning();
        
      if (!updatedLeave) {
        return res.status(404).json({ message: "Staff leave record not found" });
      }
      
      res.json(updatedLeave);
    } catch (error) {
      console.error("Error updating staff leave record:", error);
      res.status(500).json({ message: "Failed to update staff leave record" });
    }
  });
  
  app.delete("/api/staff-leave/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid staff leave ID" });
    }
    
    try {
      await db.delete(staffLeave).where(eq(staffLeave.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting staff leave record:", error);
      res.status(500).json({ message: "Failed to delete staff leave record" });
    }
  });
  
  // File upload endpoint for leave request attachments
  app.post("/api/upload", upload.single('attachment'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Return the file path that can be stored in the database
      const filePath = `/uploads/${req.file.filename}`;
      const fileUrl = `${req.protocol}://${req.get('host')}${filePath}`;
      
      res.status(201).json({ 
        message: "File uploaded successfully",
        fileUrl: fileUrl,
        fileName: req.file.originalname
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: "Failed to upload file", error: errorMessage });
    }
  });
  
  

// Resume upload endpoint with AI parsing
  app.post("/api/upload/resume", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No resume file uploaded" });
      }

      // Create directory for resumes if it doesn't exist
      const dirPath = path.join("uploads", "resumes");
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Move the file to the resumes directory with a unique filename
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(dirPath, fileName);
      fs.renameSync(req.file.path, filePath);

      // Extract text from PDF or read text file
      let resumeText = '';
      const fullPath = path.join(process.cwd(), filePath);
      
      try {
        if (req.file.mimetype === 'application/pdf') {
          try {
            // Use our custom PDF parser utility to safely extract text
            const dataBuffer = fs.readFileSync(fullPath);
            const pdfData = await parsePDF(dataBuffer);
            resumeText = pdfData.text || '';
            console.log("PDF parsed successfully, extracted text length:", resumeText.length);
          } catch (pdfError) {
            console.error("Error parsing PDF:", pdfError);
            // Fallback to basic text extraction
            const fileBuffer = fs.readFileSync(fullPath);
            resumeText = fileBuffer.toString('utf8');
            console.log("PDF parsing failed, using basic text extraction");
          }
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 req.file.mimetype === 'application/msword') {
          // For docx/doc files, we don't have a parser installed, so we'll just use a simple read
          // In a production app, you would use a library like mammoth.js or docx-parser
          const fileBuffer = fs.readFileSync(fullPath);
          // This won't extract the text properly but ensures we have some data
          resumeText = fileBuffer.toString('utf8');
          console.log("Word document detected, basic extraction completed");
        } else {
          // For text files or unknown types
          resumeText = fs.readFileSync(fullPath, 'utf8');
          console.log("Text file read successfully");
        }
      } catch (extractError) {
        console.error("Error extracting text from resume:", extractError);
        resumeText = "Unable to extract text from document.";
      }

      // Basic information extraction using regex for fallback
      const basicParser = {
        extractEmail: (text) => {
          const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
          const matches = text.match(emailRegex);
          return matches && matches.length > 0 ? matches[0] : null;
        },
        extractPhone: (text) => {
          // Match common phone number patterns
          const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
          const matches = text.match(phoneRegex);
          return matches && matches.length > 0 ? matches[0] : null;
        },
        extractName: (text) => {
          // Try to extract a name from the first few lines
          const lines = text.split('\n').slice(0, 10);
          for (const line of lines) {
            const trimmed = line.trim();
            // Look for a line that's likely a name (2-3 words, not too long)
            if (trimmed.length > 0 && trimmed.length < 40 && 
                trimmed.split(' ').length >= 2 && trimmed.split(' ').length <= 4) {
              return trimmed;
            }
          }
          return null;
        }
      };

      // Parse resume with OpenAI
      let parsedData: any = {};
      
      try {
        // Try using OpenAI for advanced parsing
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system", 
              content: "You are a resume parsing expert. Extract the following information from the resume text: name, email, phone, degree, degreeField (the field of study), yearsExperience (as a number), certifications, nativeEnglishSpeaker (true/false), and militaryExperience (true/false). Return the information in JSON format only."
            },
            {
              role: "user",
              content: resumeText
            }
          ],
          response_format: { type: "json_object" }
        });
        
        // Check if content exists and is a non-empty string
        const content = typeof response.choices[0].message.content === 'string' && 
                        response.choices[0].message.content.trim() !== '' ? 
                        response.choices[0].message.content : '{}';
        parsedData = JSON.parse(content);
        
        console.log("Resume parsed successfully with OpenAI:", parsedData);
        
        // Now generate interview questions based on the resume text
        const questionsResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system", 
              content: "You are an expert ELT (English Language Training) instructor recruiter. Based on the resume, generate 10 interview questions, categorized as follows: 4 technical questions about teaching methodology, 2 curriculum-related questions, 2 behavioral questions about classroom management, and 2 general questions about language proficiency. Return ONLY a JSON object with this format: { \"questions\": [ { \"category\": \"technical|curriculum|behavioral|general\", \"question\": \"Question text here?\" } ] }"
            },
            {
              role: "user",
              content: resumeText
            }
          ],
          response_format: { type: "json_object" }
        });
        
        // Process questions
        const questionsContent = typeof questionsResponse.choices[0].message.content === 'string' && 
                              questionsResponse.choices[0].message.content.trim() !== '' ? 
                              questionsResponse.choices[0].message.content : '{"questions":[]}';
        
        const questionsData = JSON.parse(questionsContent);
        console.log("Generated interview questions:", questionsData);
        
        // Add generated questions to the parsed data
        parsedData = {
          ...parsedData,
          generatedQuestions: questionsData.questions || []
        };
        
      } catch (aiError) {
        console.error("Error parsing resume with AI:", aiError);
        
        // Use basic parsing if OpenAI fails
        parsedData = {
          name: basicParser.extractName(resumeText),
          email: basicParser.extractEmail(resumeText),
          phone: basicParser.extractPhone(resumeText),
        };
        console.log("Using basic parser results:", parsedData);
        
        // Use our comprehensive fallback questions
        console.log("Using fallback interview questions");
        
        // Enhanced fallback questions for ELT instructors
        const fallbackQuestions = [
          // Technical Questions (10)
          { 
            category: "technical", 
            question: "How would you explain the difference between the present perfect and past perfect to students?" 
          },
          { 
            category: "technical", 
            question: "What strategies do you use to teach complex grammar structures?" 
          },
          { 
            category: "technical", 
            question: "How do you teach pronunciation to students whose native language has very different phonetics from English?" 
          },
          { 
            category: "technical", 
            question: "What methods do you use to teach English article usage (a, an, the) to students whose native language doesn't have articles?" 
          },
          { 
            category: "technical", 
            question: "How would you explain the difference between passive and active voice to aviation students?" 
          },
          { 
            category: "technical", 
            question: "What techniques do you use to help students master English prepositions?" 
          },
          { 
            category: "technical", 
            question: "How do you teach modal verbs (can, could, should, would, etc.) and their various uses?" 
          },
          { 
            category: "technical", 
            question: "What approach do you take when teaching conditionals (if clauses)?" 
          },
          { 
            category: "technical", 
            question: "How do you explain and teach the difference between countable and uncountable nouns?" 
          },
          { 
            category: "technical", 
            question: "What methods do you use to help students understand and use phrasal verbs correctly?" 
          },

          // Curriculum Questions (10)
          { 
            category: "curriculum", 
            question: "How do you support cadets or officers preparing for the ALCPT (American Language Course Placement Test)?" 
          },
          { 
            category: "curriculum", 
            question: "How would you design a specialized curriculum for aviation English focusing on radio communications?" 
          },
          { 
            category: "curriculum", 
            question: "What resources would you incorporate when teaching technical aviation terminology?" 
          },
          { 
            category: "curriculum", 
            question: "How do you balance teaching general English proficiency with specialized aviation vocabulary?" 
          },
          { 
            category: "curriculum", 
            question: "What assessment methods would you use to evaluate students' progress in an aviation English course?" 
          },
          { 
            category: "curriculum", 
            question: "How would you incorporate authentic aviation materials (manuals, checklists, etc.) into your teaching?" 
          },
          { 
            category: "curriculum", 
            question: "How would you structure a curriculum to prepare students for ICAO English language proficiency requirements?" 
          },
          { 
            category: "curriculum", 
            question: "What approaches would you take to teach listening comprehension specifically for air traffic control communications?" 
          },
          { 
            category: "curriculum", 
            question: "How would you design lesson plans that incorporate both language skills and aviation safety concepts?" 
          },
          { 
            category: "curriculum", 
            question: "What strategies would you implement to help students achieve standardized test goals while maintaining engagement?" 
          },

          // Behavioral Questions (10)
          { 
            category: "behavioral", 
            question: "Describe a time when you had to handle a classroom discipline issue. What happened and how did you resolve it?" 
          },
          { 
            category: "behavioral", 
            question: "Tell me about a situation where you had to adapt your teaching style to meet the needs of a struggling student." 
          },
          { 
            category: "behavioral", 
            question: "Describe a time when you successfully motivated a reluctant or disinterested student." 
          },
          { 
            category: "behavioral", 
            question: "Give an example of how you've handled cultural differences in the classroom." 
          },
          { 
            category: "behavioral", 
            question: "Tell me about a time when you had to provide constructive criticism to a student. How did you approach it?" 
          },
          { 
            category: "behavioral", 
            question: "Describe a situation where you had to work with a difficult colleague. How did you handle it?" 
          },
          { 
            category: "behavioral", 
            question: "Tell me about a time when you had to adjust your lesson plan on the spot. What happened and what did you do?" 
          },
          { 
            category: "behavioral", 
            question: "Describe a challenging group of students you've taught and how you managed their dynamics." 
          },
          { 
            category: "behavioral", 
            question: "Tell me about a time when you received feedback about your teaching that required you to make changes." 
          },
          { 
            category: "behavioral", 
            question: "Describe a situation where you had to balance multiple responsibilities or deadlines. How did you manage your time?" 
          },

          // General Questions (10)
          { 
            category: "general", 
            question: "What inspired you to become an English Language Instructor?" 
          },
          { 
            category: "general", 
            question: "What do you find most rewarding about teaching English to aviation professionals?" 
          },
          { 
            category: "general", 
            question: "How do you stay updated with current teaching methodologies and approaches?" 
          },
          { 
            category: "general", 
            question: "What do you believe are the most important qualities of an effective ELT instructor?" 
          },
          { 
            category: "general", 
            question: "How do you create an inclusive learning environment for students from diverse backgrounds?" 
          },
          { 
            category: "general", 
            question: "What interests you about teaching in a military aviation context specifically?" 
          },
          { 
            category: "general", 
            question: "How do you handle the challenges of teaching technical English to non-native speakers?" 
          },
          { 
            category: "general", 
            question: "What strategies do you use to keep students engaged during long instructional periods?" 
          },
          { 
            category: "general", 
            question: "How would you describe your teaching philosophy in relation to language acquisition?" 
          },
          { 
            category: "general", 
            question: "What experience or skills do you have that would be particularly valuable in this ELT program?" 
          }
        ];
        
        // Add fallback questions to the parsed data
        parsedData = {
          ...parsedData,
          generatedQuestions: fallbackQuestions
        };
      }

      // Return the file path and parsed data
      const resumeUrl = `/uploads/resumes/${fileName}`;
      
      res.status(201).json({
        url: resumeUrl,
        parsedData,
        message: "Resume uploaded and parsed successfully",
      });
    }
    catch (error) {
      console.error("Error uploading resume:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Failed to upload resume", error: errorMessage });
    }
  });
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Action Logs
  app.get("/api/action-logs", async (req, res) => {
    try {
      // Use specific fields instead of * to work around schema mismatch issues
      const logs = await db.select({
        id: actionLogs.id,
        title: actionLogs.title,
        requesterName: actionLogs.requesterName,
        description: actionLogs.description,
        createdDate: actionLogs.createdDate,
        dueDate: actionLogs.dueDate,
        completedDate: actionLogs.completedDate,
        status: actionLogs.status,
        category: actionLogs.category,
        assignedTo: actionLogs.assignedTo,
        createdBy: actionLogs.createdBy,
        schoolId: actionLogs.schoolId
      }).from(actionLogs).orderBy(actionLogs.createdDate);
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching action logs:", error);
      res.status(500).json({ message: "Failed to fetch action logs" });
    }
  });

  app.get("/api/action-logs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid action log ID" });
    }
    
    try {
      const [log] = await db.select().from(actionLogs).where(eq(actionLogs.id, id));
      
      if (!log) {
        return res.status(404).json({ message: "Action log not found" });
      }
      
      res.json(log);
    } catch (error) {
      console.error("Error fetching action log:", error);
      res.status(500).json({ message: "Failed to fetch action log" });
    }
  });

  app.post("/api/action-logs", async (req, res) => {
    try {
      // Process incoming data - handle date conversion if needed
      const rawData = req.body;
      
      // Parse the date string to a proper Date object if it exists
      const processedData = {
        ...rawData,
        dueDate: rawData.dueDate ? new Date(rawData.dueDate) : undefined,
      };
      
      // Set created by to current user if authenticated
      const userId = req.isAuthenticated() ? req.user.id : 1;
      
      // Now parse with the schema
      const logData = insertActionLogSchema.parse({
        ...processedData,
        createdBy: userId
      });
      
      const [log] = await db.insert(actionLogs).values({
        ...logData,
        createdDate: new Date()
      }).returning();
      
      // Log the activity
      await dbStorage.createActivity({
        type: "action_log_created",
        description: `New action log "${log.title}" created`,
        timestamp: new Date(),
        userId: userId
      });
      
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating action log:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create action log" });
    }
  });

  app.patch("/api/action-logs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid action log ID" });
    }
    
    try {
      // Get existing log to check if it exists
      const [existingLog] = await db.select().from(actionLogs).where(eq(actionLogs.id, id));
      
      if (!existingLog) {
        return res.status(404).json({ message: "Action log not found" });
      }
      
      // Process the incoming data and handle date conversion
      const rawData = req.body;
      
      // If status is being changed to completed, set completedDate
      let processedData = {
        ...rawData,
        dueDate: rawData.dueDate ? new Date(rawData.dueDate) : undefined,
      };
      
      // Set completedDate when status changes to 'completed'
      if (rawData.status === 'completed' && existingLog.status !== 'completed') {
        processedData.completedDate = new Date();
      }
      
      // Clear completedDate when status changes from 'completed' to something else
      if (rawData.status && rawData.status !== 'completed' && existingLog.status === 'completed') {
        processedData.completedDate = null;
      }
      
      const updateData = insertActionLogSchema.partial().parse(processedData);
      
      const [updatedLog] = await db
        .update(actionLogs)
        .set(updateData)
        .where(eq(actionLogs.id, id))
        .returning();
      
      // Log activity
      await dbStorage.createActivity({
        type: "action_log_updated",
        description: `Action log "${updatedLog.title}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedLog);
    } catch (error) {
      console.error("Error updating action log:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update action log" });
    }
  });

  app.delete("/api/action-logs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid action log ID" });
    }
    
    try {
      // Get the log before deleting for the activity log
      const [log] = await db.select().from(actionLogs).where(eq(actionLogs.id, id));
      
      if (!log) {
        return res.status(404).json({ message: "Action log not found" });
      }
      
      await db.delete(actionLogs).where(eq(actionLogs.id, id));
      
      // Log activity
      await dbStorage.createActivity({
        type: "action_log_deleted",
        description: `Action log "${log.title}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting action log:", error);
      res.status(500).json({ message: "Failed to delete action log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
