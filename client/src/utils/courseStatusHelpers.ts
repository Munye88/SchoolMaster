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
  // EXTRA DEBUGGING: Something is wrong with date comparisons
  console.log(`DETAILED DEBUG - Course: ${course.name}`);
  console.log(`Raw dates - Start: ${course.startDate}, Today's date: ${new Date().toISOString()}`);

  // Get yyyy-mm-dd date strings for comparison
  const today = new Date().toISOString().split('T')[0];
  
  // Format course dates (if in format yyyy-MM-dd, this still works)
  // Handle both ISO dates and plain dates
  const startDate = course.startDate.includes('T') 
    ? course.startDate.split('T')[0] 
    : course.startDate;
  
  const endDate = course.endDate 
    ? (course.endDate.includes('T') ? course.endDate.split('T')[0] : course.endDate)
    : null;
  
  // Debug logging 
  console.log(`Comparing - Today: ${today}, Start date: ${startDate}`);
  console.log(`String comparison: ${today} >= ${startDate} = ${today >= startDate}`);

  // Handle dates
  const todayObj = new Date(today);
  const startDateObj = new Date(startDate);
  
  console.log(`Date object comparison: ${todayObj.getTime()} >= ${startDateObj.getTime()} = ${todayObj.getTime() >= startDateObj.getTime()}`);
  
  // If course has ended
  if (endDate && today > endDate) {
    console.log(`Course is COMPLETED`);
    return 'Completed';
  }
  
  // If course has started (today is on or after start date)
  if (today >= startDate) {
    console.log(`Course is IN PROGRESS`);
    return 'In Progress';
  }
  
  // Course hasn't started yet
  console.log(`Course is STARTING SOON`);
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