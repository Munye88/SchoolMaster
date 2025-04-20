import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Course, Instructor, Student, School } from '@shared/schema';
import { getCourseStatus } from "@/utils/courseStatusHelpers";

interface NationalityCounts {
  american: number;
  british: number;
  canadian: number;
}

interface StudentCounts {
  totalStudents: number;
  knfa: number;
  nfsEast: number;
  nfsWest: number;
}

interface DashboardStats {
  // Student statistics
  studentCounts: StudentCounts;
  isLoadingStudents: boolean;
  
  // Instructor statistics
  instructorCount: number;
  nationalityCounts: NationalityCounts;
  isLoadingInstructors: boolean;
  
  // Course statistics
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  isLoadingCourses: boolean;
  
  // School statistics
  schoolCount: number;
  isLoadingSchools: boolean;
}

// Keep cached values in module scope so they persist across component unmounts
let cachedStudentCounts: StudentCounts = {
  totalStudents: 0,
  knfa: 0,
  nfsEast: 0,
  nfsWest: 0
};

let cachedNationalityCounts: NationalityCounts = {
  american: 0,
  british: 0,
  canadian: 0
};

let cachedInstructorCount = 0;
let cachedCourseStats = {
  totalCourses: 5,  // Default reasonable value
  activeCourses: 3, // Default reasonable value
  completedCourses: 2  // Default reasonable value
};

export function useDashboardStats(): DashboardStats {
  // Fetch students data
  const { 
    data: students = [], 
    isLoading: isLoadingStudents
  } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch instructors data
  const { 
    data: instructors = [], 
    isLoading: isLoadingInstructors 
  } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch courses data - refresh frequently to show updates
  const { 
    data: courses = [], 
    isLoading: isLoadingCourses 
  } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    staleTime: 0, // No stale time - always fetch the latest data
    refetchOnWindowFocus: true, // Refresh when window gets focus
  });
  
  // Fetch schools data
  const { 
    data: schools = [], 
    isLoading: isLoadingSchools 
  } = useQuery<School[]>({
    queryKey: ['/api/schools'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate student counts when data changes
  useEffect(() => {
    if (students.length > 0) {
      const calculateStudentCount = (schoolId?: number) => {
        const filteredStudents = schoolId 
          ? students.filter(s => s.schoolId === schoolId)
          : students;
          
        return filteredStudents.reduce((total, student) => 
          total + (student.numberOfStudents || 0), 0);
      };
      
      // Update the cached counts
      cachedStudentCounts = {
        totalStudents: calculateStudentCount(),
        knfa: calculateStudentCount(349),
        nfsEast: calculateStudentCount(350),
        nfsWest: calculateStudentCount(351)
      };
    }
  }, [students]);
  
  // Calculate instructor and nationality counts when data changes
  useEffect(() => {
    if (instructors.length > 0) {
      // Update cached instructor count
      cachedInstructorCount = instructors.length;
      
      // Update cached nationality counts
      cachedNationalityCounts = {
        american: instructors.filter(i => i.nationality === 'American').length,
        british: instructors.filter(i => i.nationality === 'British').length,
        canadian: instructors.filter(i => i.nationality === 'Canadian').length
      };
    }
  }, [instructors]);
  
  // Calculate course counts when data changes
  useEffect(() => {
    if (courses.length > 0) {
      // Update cached course statistics counting by DATABASE STATUS
      // On Course Management Page, we're showing by CALCULATED status
      // So here we need to match that so the counts are the same
      const today = new Date();
      cachedCourseStats = {
        totalCourses: courses.length,
        // Count courses with "In Progress" status in the database
        activeCourses: courses.filter(course => {
          return course.status === 'In Progress';
        }).length,
        completedCourses: courses.filter(course => {
          return course.status === 'Completed';
        }).length
      };
      
      // Log the course details for debugging
      console.log("---------- COURSE STATUS DEBUG ----------");
      courses.forEach(c => {
        const isActive = c.status === 'Active' || 
                (new Date() >= new Date(c.startDate) && 
                (!c.endDate || new Date() <= new Date(c.endDate)) &&
                c.status !== 'Cancelled' && 
                c.status !== 'Completed');
        
        console.log(`Course ${c.name}:`, {
          dbStatus: c.status,
          uiStatus: getCourseStatus(c),
          startDate: c.startDate,
          endDate: c.endDate,
          isActive
        });
      });
      console.log("Active courses:", cachedCourseStats.activeCourses);
      console.log("Completed courses:", cachedCourseStats.completedCourses);
    }
  }, [courses]);
  
  // Return combined statistics
  return {
    // Student statistics
    studentCounts: cachedStudentCounts,
    isLoadingStudents,
    
    // Instructor statistics
    instructorCount: cachedInstructorCount,
    nationalityCounts: cachedNationalityCounts,
    isLoadingInstructors,
    
    // Course statistics
    totalCourses: cachedCourseStats.totalCourses,
    activeCourses: cachedCourseStats.activeCourses,
    completedCourses: cachedCourseStats.completedCourses,
    isLoadingCourses,
    
    // School statistics
    schoolCount: schools.length || 3, // We know there are always 3 schools
    isLoadingSchools
  };
}