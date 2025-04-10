import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertInstructorSchema, insertCourseSchema, insertActivitySchema, insertEventSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API routes - prefix all routes with /api
  
  // Schools
  app.get("/api/schools", async (req, res) => {
    const schools = await storage.getSchools();
    res.json(schools);
  });
  
  app.get("/api/schools/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const school = await storage.getSchool(id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    
    res.json(school);
  });
  
  app.get("/api/schools/code/:code", async (req, res) => {
    const code = req.params.code;
    const school = await storage.getSchoolByCode(code);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    
    res.json(school);
  });
  
  app.post("/api/schools", async (req, res) => {
    try {
      const schoolData = insertSchoolSchema.parse(req.body);
      const school = await storage.createSchool(schoolData);
      
      // Log activity
      await storage.createActivity({
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
      const updatedSchool = await storage.updateSchool(id, updateData);
      
      if (!updatedSchool) {
        return res.status(404).json({ message: "School not found" });
      }
      
      // Log activity
      await storage.createActivity({
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
      const school = await storage.getSchool(id);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      
      await storage.deleteSchool(id);
      
      // Log activity
      await storage.createActivity({
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
    const instructors = await storage.getInstructors();
    res.json(instructors);
  });
  
  app.get("/api/instructors/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    const instructor = await storage.getInstructor(id);
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
    
    const instructors = await storage.getInstructorsBySchool(schoolId);
    res.json(instructors);
  });
  
  app.post("/api/instructors", async (req, res) => {
    try {
      const instructorData = insertInstructorSchema.parse(req.body);
      const instructor = await storage.createInstructor(instructorData);
      
      // Log activity
      await storage.createActivity({
        type: "instructor_added",
        description: `New instructor "${instructor.name}" added`,
        timestamp: new Date(),
        userId: 1 // Hardcoded for now
      });
      
      res.status(201).json(instructor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid instructor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create instructor" });
    }
  });
  
  app.patch("/api/instructors/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    try {
      const updateData = insertInstructorSchema.partial().parse(req.body);
      const updatedInstructor = await storage.updateInstructor(id, updateData);
      
      if (!updatedInstructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      
      // Log activity
      await storage.createActivity({
        type: "instructor_updated",
        description: `Instructor "${updatedInstructor.name}" updated`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.json(updatedInstructor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid instructor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update instructor" });
    }
  });
  
  app.delete("/api/instructors/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    try {
      // Get the instructor before deleting for the activity log
      const instructor = await storage.getInstructor(id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      
      await storage.deleteInstructor(id);
      
      // Log activity
      await storage.createActivity({
        type: "instructor_deleted",
        description: `Instructor "${instructor.name}" deleted`,
        timestamp: new Date(),
        userId: req.isAuthenticated() ? req.user.id : 1
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete instructor" });
    }
  });
  
  // Courses
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });
  
  app.get("/api/courses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    
    const course = await storage.getCourse(id);
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
    
    const courses = await storage.getCoursesBySchool(schoolId);
    res.json(courses);
  });
  
  app.get("/api/instructors/:instructorId/courses", async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
    if (isNaN(instructorId)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }
    
    const courses = await storage.getCoursesByInstructor(instructorId);
    res.json(courses);
  });
  
  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      
      // Log activity
      await storage.createActivity({
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
      const updatedCourse = await storage.updateCourse(id, updateData);
      
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Log activity
      await storage.createActivity({
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
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      await storage.deleteCourse(id);
      
      // Log activity
      await storage.createActivity({
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
  
  // Activities
  app.get("/api/activities/recent", async (req, res) => {
    const limit = parseInt(req.query.limit as string || '5');
    const activities = await storage.getRecentActivities(limit);
    res.json(activities);
  });
  
  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
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
    const events = await storage.getEvents();
    res.json(events);
  });
  
  app.get("/api/schools/:id/events", async (req, res) => {
    const schoolId = parseInt(req.params.id);
    if (isNaN(schoolId)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }
    
    const events = await storage.getEvents();
    const schoolEvents = events.filter(event => event.schoolId === schoolId);
    res.json(schoolEvents);
  });
  
  app.get("/api/events/upcoming", async (req, res) => {
    const limit = parseInt(req.query.limit as string || '5');
    const events = await storage.getUpcomingEvents(limit);
    res.json(events);
  });
  
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
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
    const schools = await storage.getSchools();
    const schoolStats = await Promise.all(
      schools.map(async (school) => {
        const instructors = await storage.getInstructorsBySchool(school.id);
        const courses = await storage.getCoursesBySchool(school.id);
        
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
    const instructors = await storage.getInstructors();
    
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

  const httpServer = createServer(app);
  return httpServer;
}
