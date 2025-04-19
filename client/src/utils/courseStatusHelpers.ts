import { Course } from '@shared/schema';

/**
 * Calculate the actual status of a course based on its dates
 * @param course The course object
 * @returns The calculated status of the course
 */
export function calculateCourseStatus(course: Course): string {
  const today = new Date();
  const startDate = new Date(course.startDate);
  const endDate = course.endDate ? new Date(course.endDate) : null;
  
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