import { Course } from '@shared/schema';

/**
 * Calculate the actual status of a course based on its dates
 * @param course The course object
 * @returns The calculated status of the course
 */
export function calculateCourseStatus(course: Course): string {
  // Get today's date at midnight for consistent comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse dates and set to midnight
  const startDate = new Date(course.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  let endDate = null;
  if (course.endDate) {
    endDate = new Date(course.endDate);
    endDate.setHours(0, 0, 0, 0);
  }
  
  // Debug logging
  console.log(`Course: ${course.name}, Start: ${startDate.toISOString()}, Today: ${today.toISOString()}`);
  console.log(`Comparison: today >= startDate = ${today >= startDate}`);
  
  // If course has ended
  if (endDate && today > endDate) {
    return 'Completed';
  }
  
  // If course has started
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