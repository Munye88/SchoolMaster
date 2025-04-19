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
  // Simplest possible implementation that should be reliable
  
  // Create date objects and reset time to ensure consistent comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse start date
  const startDateParts = course.startDate.split('-');
  const startDate = new Date(
    parseInt(startDateParts[0]), // year
    parseInt(startDateParts[1]) - 1, // month (0-indexed)
    parseInt(startDateParts[2].substring(0, 2)) // day
  );
  startDate.setHours(0, 0, 0, 0);
  
  // Parse end date if exists
  let endDate = null;
  if (course.endDate) {
    const endDateParts = course.endDate.split('-');
    endDate = new Date(
      parseInt(endDateParts[0]), // year
      parseInt(endDateParts[1]) - 1, // month (0-indexed)
      parseInt(endDateParts[2].substring(0, 2)) // day
    );
    endDate.setHours(0, 0, 0, 0);
  }
  
  // Simple time comparison using timestamps
  const todayTime = today.getTime();
  const startTime = startDate.getTime();
  const endTime = endDate ? endDate.getTime() : null;
  
  // Log for debugging
  console.log(`Course ${course.name}: Today=${todayTime}, Start=${startTime}, End=${endTime}`);
  
  // Determine status based on time comparison
  if (endTime && todayTime > endTime) {
    return 'Completed';
  }
  
  if (todayTime >= startTime) {
    return 'In Progress';
  }
  
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