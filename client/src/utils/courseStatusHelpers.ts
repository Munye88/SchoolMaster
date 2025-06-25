import { Course } from '@shared/schema';

/**
 * Calculate course progress percentage based on start and end dates
 * @param course The course object
 * @returns A number between 0-100 representing the course progress
 */
export function calculateCourseProgress(course: Course): number {
  // Cannot calculate progress without valid dates
  if (!course.startDate || !course.endDate) {
    // Use stored progress if no dates available
    return course.progress || 0;
  }

  try {
    // Parse dates safely
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const today = new Date();
    
    // Ensure dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn(`Invalid date format for course ${course.name}`);
      return course.progress || 0;
    }
    
    // Handle case where end date is before start date (incorrect data)
    if (endDate < startDate) {
      console.warn(`Course ${course.name} has end date before start date. Using stored progress.`);
      return course.progress || 0;
    }
    
    // If course hasn't started yet
    if (today < startDate) {
      return 0;
    }
    
    // If course is already complete
    if (today > endDate) {
      return 100;
    }
    
    // Calculate progress as percentage of time elapsed
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    
    const progressPercent = Math.round((elapsedDuration / totalDuration) * 100);
    
    // Ensure progress is between 0-100
    const calculatedProgress = Math.max(0, Math.min(100, progressPercent));
    
    // Use the higher of calculated or stored progress (courses can be manually advanced)
    return Math.max(calculatedProgress, course.progress || 0);
  } catch (error) {
    console.error(`Error calculating progress for course:`, course, error);
    return course.progress || 0;
  }
}

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

    // Handle case where end date is before start date (incorrect data)
    if (endTime && endTime < startTime) {
      console.warn(`Course ${course.name} has end date before start date. Using database status.`);
      return course.status;
    }
    
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
  // Always respect stored status for Completed and Starting Soon
  if (course.status === 'Completed') {
    return 'Completed';
  }
  
  if (course.status === 'Starting Soon') {
    return 'Starting Soon';
  }
  
  if (!useCalculated) {
    return course.status;
  }
  
  return calculateCourseStatus(course);
}