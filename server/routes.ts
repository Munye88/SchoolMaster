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
  evaluations,
  courses,
  staffLeave,
  instructors,
  actionLogs
} from "@shared/schema";
import { setupAuth } from "./auth";
import { generateAIResponse } from "./services/ai";
import { AIChatRequest } from "../client/src/lib/ai-types";
import { initDatabase } from "./initDb";

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
  
  // Configure multer storage
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const fileExtension = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    }
  });
  
  const upload = multer({ storage: storage });
  
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
      console.log("🚀 PATCH /api/instructors/:id - Request body:", req.body);
      
      // Check for fields mismatch
      const { status, position, ...rest } = req.body;
      const processedData = {
        ...rest,
        ...(status && { accompaniedStatus: status }), // Only add if status exists
        ...(position && { role: position }) // Only add if position exists
      };
      
      console.log("🚀 Processed data before schema validation:", processedData);
      
      const updateData = insertInstructorSchema.partial().parse(processedData);
      console.log("🚀 Validated update data:", updateData);
      
      const updatedInstructor = await dbStorage.updateInstructor(id, updateData);
      console.log("🚀 Updated instructor:", updatedInstructor);
      
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
      const courseData = insertCourseSchema.parse(req.body);
      const course = await dbStorage.createCourse(courseData);
      
      // Log activity
      await dbStorage.createActivity({
        type: "course_added",
        description: `New course "${course.name}" added`,
        timestamp: new Date(),
        userId: 1 // Hardcoded for now
      });
      
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });
  
  app.patch("/api/courses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    
    try {
      const updateData = insertCourseSchema.partial().parse(req.body);
      const updatedCourse = await dbStorage.updateCourse(id, updateData);
      
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Log activity
      await dbStorage.createActivity({
        type: "course_updated",
        description: `Course "${updatedCourse.name}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update course" });
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
        
        // Filter by date (prefix match) and by instructors from the specified school
        const schoolInstructors = await dbStorage.getInstructorsBySchool(schoolIdNum);
        const instructorIds = schoolInstructors.map(instructor => instructor.id);
        
        const filteredAttendance = allAttendance.filter(record => {
          return record.date.startsWith(date as string) && 
                 instructorIds.includes(record.instructorId);
        });
        
        return res.json(filteredAttendance);
      }
      
      if (date) {
        // Filter by date only
        const attendance = await dbStorage.getStaffAttendanceByDate(date as string);
        return res.json(attendance);
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
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Action Logs
  app.get("/api/action-logs", async (req, res) => {
    try {
      const logs = await db.select().from(actionLogs).orderBy(actionLogs.createdDate);
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
      const processedData = {
        ...rawData,
        dueDate: rawData.dueDate ? new Date(rawData.dueDate) : undefined,
      };
      
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
