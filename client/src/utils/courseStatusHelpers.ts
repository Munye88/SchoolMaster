import { Course } from '@shared/schema';

/**
 * Calculate the actual status of a course based on its dates
 * IMPORTANT: This is a simpler implementation that converts dates to simple timestamps
 * to ensure consistent comparison
 * 
 * @param course The course object
 * @returns The calculated status of the course
 */
export function calculateCourseStatus(course: Course): string {
  // Force dates to be compared as simple timestamps (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  // Get date part only from course dates 
  const startDate = course.startDate.split('T')[0];
  const endDate = course.endDate ? course.endDate.split('T')[0] : null;
  
  // Debug logging 
  console.log(`Course: ${course.name}, Start: ${startDate}, Today: ${today}`);
  console.log(`Comparison result: ${today >= startDate ? 'In Progress/Completed' : 'Starting Soon'}`);
  
  // If course has ended
  if (endDate && today > endDate) {
    return 'Completed';
  }
  
  // If course has started (today is on or after start date)
  if (today >= startDate) {
    return 'In Progress';
  }
  
  // Course hasn't started yet
  return 'Starting Soon';
}

/**
 * Returns either the stored status or calculated status based on a flag
 * @param course The course object
 * @param useCalculated Whether to use the calculated status (true) or the stored status (false)
 * @returns Either the stored or calculated status
 */
export function getCourseStatus(course: Course, useCalculated: boolean = true): string {
  if (!useCalculated) {
    return course.status;
  }
  
  return calculateCourseStatus(course);
}