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
  // Handle invalid course data
  if (!course || !course.startDate) {
    console.warn(`Course has invalid data:`, course);
    return 'Unknown';
  }

  try {
    // Create date objects and reset time to ensure consistent comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse start date safely
    let startDate: Date;
    
    // Try different date formats
    if (typeof course.startDate === 'string' && course.startDate.includes('-')) {
      const startDateParts = course.startDate.split('-');
      if (startDateParts.length === 3) {
        startDate = new Date(
          parseInt(startDateParts[0]), // year
          parseInt(startDateParts[1]) - 1, // month (0-indexed)
          parseInt(startDateParts[2].substring(0, 2)) // day
        );
      } else {
        // Fallback to direct parsing if format is unexpected
        startDate = new Date(course.startDate);
      }
    } else {
      // Last resort direct parsing
      startDate = new Date(course.startDate);
    }
    
    // Validate start date
    if (isNaN(startDate.getTime())) {
      console.warn(`Invalid start date format for course ${course.name}: ${course.startDate}`);
      return 'Unknown';
    }
    
    startDate.setHours(0, 0, 0, 0);
    
    // Parse end date if exists - with similar safety checks
    let endDate = null;
    if (course.endDate) {
      if (typeof course.endDate === 'string' && course.endDate.includes('-')) {
        const endDateParts = course.endDate.split('-');
        if (endDateParts.length === 3) {
          endDate = new Date(
            parseInt(endDateParts[0]), // year
            parseInt(endDateParts[1]) - 1, // month (0-indexed)
            parseInt(endDateParts[2].substring(0, 2)) // day
          );
        } else {
          endDate = new Date(course.endDate);
        }
      } else {
        endDate = new Date(course.endDate);
      }
      
      if (!isNaN(endDate.getTime())) {
        endDate.setHours(0, 0, 0, 0);
      } else {
        console.warn(`Invalid end date format for course ${course.name}: ${course.endDate}`);
        endDate = null;
      }
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
      // Check if the stored status is "Active" - if so, return "In Progress" for UI display
      if (course.status === "Active") {
        return 'In Progress';
      }
      return 'In Progress';
    }
    
    return 'Starting Soon';
  } catch (error) {
    console.error(`Error calculating status for course:`, course, error);
    return 'Unknown';
  }
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