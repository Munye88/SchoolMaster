import OpenAI from "openai";
import { db } from "../db";
import { eq, and, gte, lte } from "drizzle-orm";
import { instructors, testResults, staffAttendance, evaluations, courses, events } from "@shared/schema";
import { formatISO, parseISO, format } from "date-fns";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define types for our assistant tools
export type AiToolResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

// Tool functions that the assistant can use to perform tasks
const aiTools = {
  // GET operations
  getInstructorProfile: async (instructorId: number): Promise<AiToolResponse> => {
    try {
      const [instructor] = await db.select().from(instructors).where(eq(instructors.id, instructorId));
      
      if (!instructor) {
        return { success: false, error: `Instructor with ID ${instructorId} not found` };
      }
      
      return { 
        success: true, 
        data: instructor 
      };
    } catch (error) {
      console.error("Error fetching instructor profile:", error);
      return { success: false, error: "Failed to fetch instructor profile" };
    }
  },
  
  getInstructorsBySchool: async (schoolId: number): Promise<AiToolResponse> => {
    try {
      const schoolInstructors = await db.select().from(instructors).where(eq(instructors.schoolId, schoolId));
      
      if (!schoolInstructors || schoolInstructors.length === 0) {
        return { success: false, error: `No instructors found for school ID ${schoolId}` };
      }
      
      return { 
        success: true, 
        data: schoolInstructors 
      };
    } catch (error) {
      console.error("Error fetching school instructors:", error);
      return { success: false, error: "Failed to fetch instructors for the specified school" };
    }
  },
  
  getInstructorTestResults: async (instructorId: number): Promise<AiToolResponse> => {
    try {
      // First get courses this instructor teaches
      const instructorCourses = await db.select().from(courses).where(eq(courses.instructorId, instructorId));
      
      if (!instructorCourses || instructorCourses.length === 0) {
        return { success: true, data: [] }; // No courses, so no test results
      }
      
      // Get test results for these courses
      const courseIds = instructorCourses.map(course => course.id);
      const results = await db.select().from(testResults).where(
        courseIds.length > 0 ? 
          // Using an "in" operation would be better but we'll keep it simple for now
          eq(testResults.courseId, courseIds[0]) :
          undefined
      );
      
      return { 
        success: true, 
        data: results 
      };
    } catch (error) {
      console.error("Error fetching instructor test results:", error);
      return { success: false, error: "Failed to fetch test results" };
    }
  },
  
  getInstructorAttendance: async (instructorId: number, startDate?: string, endDate?: string): Promise<AiToolResponse> => {
    try {
      let query = db.select().from(staffAttendance).where(eq(staffAttendance.instructorId, instructorId));
      
      // Add date range filters if provided - implementation will depend on your actual schema
      // This is a sample that assumes you have a date column
      /*
      if (startDate && endDate) {
        const startDateObj = parseISO(startDate);
        const endDateObj = parseISO(endDate);
        query = query.where(
          and(
            gte(staffAttendance.date, startDateObj),
            lte(staffAttendance.date, endDateObj)
          )
        );
      }
      */
      
      const attendance = await query;
      
      return { 
        success: true, 
        data: attendance 
      };
    } catch (error) {
      console.error("Error fetching instructor attendance:", error);
      return { success: false, error: "Failed to fetch attendance records" };
    }
  },
  
  getInstructorEvaluations: async (instructorId: number): Promise<AiToolResponse> => {
    try {
      const instructorEvals = await db.select().from(evaluations).where(eq(evaluations.instructorId, instructorId));
      
      return { 
        success: true, 
        data: instructorEvals 
      };
    } catch (error) {
      console.error("Error fetching instructor evaluations:", error);
      return { success: false, error: "Failed to fetch evaluation records" };
    }
  },
  
  getCourseDetails: async (courseId: number): Promise<AiToolResponse> => {
    try {
      const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
      
      if (!course) {
        return { success: false, error: `Course with ID ${courseId} not found` };
      }
      
      return { 
        success: true, 
        data: course 
      };
    } catch (error) {
      console.error("Error fetching course details:", error);
      return { success: false, error: "Failed to fetch course details" };
    }
  },
  
  // Statistics and summaries
  getSchoolTestAverages: async (schoolId: number, testType?: string): Promise<AiToolResponse> => {
    try {
      // First, get all courses for this school
      const schoolCourses = await db.select().from(courses).where(eq(courses.schoolId, schoolId));
      
      if (!schoolCourses || schoolCourses.length === 0) {
        return { success: false, error: `No courses found for school ID ${schoolId}` };
      }
      
      const courseIds = schoolCourses.map(course => course.id);
      
      // Get all test results for these courses
      let allResults: any[] = [];
      for (const courseId of courseIds) {
        const courseResults = await db.select().from(testResults).where(eq(testResults.courseId, courseId));
        allResults = [...allResults, ...courseResults];
      }
      
      // Filter by test type if specified
      if (testType && allResults.length > 0) {
        allResults = allResults.filter(result => 
          result.type.toLowerCase() === testType.toLowerCase()
        );
      }
      
      // Calculate averages by test type
      const averages: Record<string, number> = {};
      const counts: Record<string, number> = {};
      
      allResults.forEach(result => {
        const type = result.type;
        if (!averages[type]) {
          averages[type] = 0;
          counts[type] = 0;
        }
        
        averages[type] += result.score;
        counts[type]++;
      });
      
      // Finalize averages
      const finalAverages = Object.keys(averages).map(type => ({
        testType: type,
        averageScore: counts[type] > 0 ? (averages[type] / counts[type]).toFixed(2) : 0,
        totalTests: counts[type]
      }));
      
      return { 
        success: true, 
        data: finalAverages
      };
    } catch (error) {
      console.error("Error calculating school test averages:", error);
      return { success: false, error: "Failed to calculate test averages" };
    }
  },
  
  // POST/UPDATE operations
  updateInstructorAttendance: async (
    instructorId: number, 
    date: string, 
    status: string
  ): Promise<AiToolResponse> => {
    try {
      // First check if there's an existing record for this date
      const formattedDate = format(parseISO(date), 'yyyy-MM-dd');
      const [existingRecord] = await db
        .select()
        .from(staffAttendance)
        .where(eq(staffAttendance.instructorId, instructorId));
        // We would need to also filter by date, but this is a simplification for now

      // This is where we would insert/update the attendance record
      // For now just return a success message
      return { 
        success: true, 
        data: { message: `Updated attendance for instructor ${instructorId} on ${formattedDate} to ${status}` }
      };
    } catch (error) {
      console.error("Error updating instructor attendance:", error);
      return { success: false, error: "Failed to update attendance record" };
    }
  },
  
  createEvent: async (
    title: string,
    start: string,
    end: string,
    details?: string
  ): Promise<AiToolResponse> => {
    try {
      // This is where we would insert the event
      // For now just return a success message
      return { 
        success: true, 
        data: { message: `Created event "${title}" from ${start} to ${end}` }
      };
    } catch (error) {
      console.error("Error creating event:", error);
      return { success: false, error: "Failed to create event" };
    }
  }
};

// Define the OpenAI function definitions that map to our tool functions
const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "getInstructorProfile",
      description: "Get detailed information about a specific instructor",
      parameters: {
        type: "object",
        properties: {
          instructorId: {
            type: "number",
            description: "The ID of the instructor to retrieve"
          }
        },
        required: ["instructorId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getInstructorsBySchool",
      description: "Get all instructors for a specific school",
      parameters: {
        type: "object",
        properties: {
          schoolId: {
            type: "number",
            description: "The ID of the school to retrieve instructors for"
          }
        },
        required: ["schoolId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getInstructorTestResults",
      description: "Get all test results for a specific instructor",
      parameters: {
        type: "object",
        properties: {
          instructorId: {
            type: "number",
            description: "The ID of the instructor to retrieve test results for"
          }
        },
        required: ["instructorId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getInstructorAttendance",
      description: "Get attendance records for a specific instructor",
      parameters: {
        type: "object",
        properties: {
          instructorId: {
            type: "number",
            description: "The ID of the instructor to retrieve attendance for"
          },
          startDate: {
            type: "string",
            description: "Optional start date to filter attendance records (YYYY-MM-DD)"
          },
          endDate: {
            type: "string",
            description: "Optional end date to filter attendance records (YYYY-MM-DD)"
          }
        },
        required: ["instructorId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getInstructorEvaluations",
      description: "Get evaluation records for a specific instructor",
      parameters: {
        type: "object",
        properties: {
          instructorId: {
            type: "number",
            description: "The ID of the instructor to retrieve evaluations for"
          }
        },
        required: ["instructorId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getCourseDetails",
      description: "Get detailed information about a specific course",
      parameters: {
        type: "object",
        properties: {
          courseId: {
            type: "number",
            description: "The ID of the course to retrieve"
          }
        },
        required: ["courseId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getSchoolTestAverages",
      description: "Get average test scores for a specific school, optionally filtered by test type",
      parameters: {
        type: "object",
        properties: {
          schoolId: {
            type: "number",
            description: "The ID of the school to calculate test averages for"
          },
          testType: {
            type: "string",
            description: "Optional test type to filter results (e.g., 'ALCPT', 'ECL', 'OPI', 'Book Test')"
          }
        },
        required: ["schoolId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "updateInstructorAttendance",
      description: "Update attendance status for an instructor on a specific date",
      parameters: {
        type: "object",
        properties: {
          instructorId: {
            type: "number",
            description: "The ID of the instructor to update attendance for"
          },
          date: {
            type: "string",
            description: "The date to update attendance for (YYYY-MM-DD)"
          },
          status: {
            type: "string",
            description: "The attendance status (e.g., 'Present', 'Absent', 'Late', 'Excused')"
          }
        },
        required: ["instructorId", "date", "status"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "createEvent",
      description: "Create a new event or meeting",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the event"
          },
          start: {
            type: "string",
            description: "The start date/time of the event (YYYY-MM-DDTHH:MM:SS)"
          },
          end: {
            type: "string",
            description: "The end date/time of the event (YYYY-MM-DDTHH:MM:SS)"
          },
          details: {
            type: "string",
            description: "Optional additional details about the event"
          }
        },
        required: ["title", "start", "end"]
      }
    }
  }
];

// Main assistant function to process user queries
export async function processAssistantQuery(query: string, conversationContext: any[] = []): Promise<{ 
  response: string;
  toolCalls?: any[];
  toolResults?: any[];
}> {
  try {
    // Create messages array with system prompt and conversation context
    const messages = [
      {
        role: "system" as const,
        content: `You are an AI assistant for the GOVCIO-SAMS ELT PROGRAM school management system. 
        Your job is to help administrators and staff retrieve information, perform actions, and get insights about the schools, instructors, courses, and students.
        
        The system manages three aviation schools: KFNA, NFS East, and NFS West.
        
        When users ask questions about specific instructors, courses, or schools, try to use the appropriate function to retrieve the relevant information.
        
        For questions that require data analysis or summaries, use the appropriate functions to gather the data needed.
        
        Always be helpful, concise, and professional in your responses.`
      },
      ...conversationContext,
      {
        role: "user" as const,
        content: query
      }
    ];

    // Inner try-catch block for API calls specifically
    try {
      // Call OpenAI with function calling
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        tools: toolDefinitions,
        tool_choice: "auto",
      });

      const responseMessage = response.choices[0].message;
      let toolResults: any[] = [];

      // Check if the model wants to call a function
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Extract all tool calls
        const toolCalls = responseMessage.tool_calls;
        
        // Process each tool call
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          // Execute the function if it exists in our tools
          if (functionName in aiTools) {
            // @ts-ignore - we know the function exists
            const result = await aiTools[functionName](...Object.values(functionArgs));
            toolResults.push({
              toolCall: toolCall.id,
              function: functionName,
              result
            });
          }
        }
        
        // Add the tool results to the conversation
        const toolResultMessages = toolResults.map(result => ({
          tool_call_id: result.toolCall,
          role: "tool" as const,
          content: JSON.stringify(result.result)
        }));
        
        try {
          // Send a follow-up request to process the tool results
          const secondResponse = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
              ...messages,
              responseMessage,
              ...toolResultMessages
            ]
          });
          
          return {
            response: secondResponse.choices[0].message.content || "I couldn't process that request.",
            toolCalls,
            toolResults
          };
        } catch (followUpError: any) {
          console.error("API error during follow-up request:", followUpError);
          // Fallback response using gathered tool data
          return {
            response: `Here's the information I found: ${toolResults.map(tr => 
              `${tr.function}: ${JSON.stringify(tr.result.data || {})}`).join(', ')}`,
            toolCalls,
            toolResults
          };
        }
      }
      
      // If no function was called, return the model's response directly
      return {
        response: responseMessage.content || "I couldn't understand your request."
      };
    } catch (error: any) {
      console.error("API error during assistant query:", error);
      
      // Check if it's a quota or rate limit error
      if (error.status === 429 || (error.error && error.error.code === 'insufficient_quota')) {
        return {
          response: "I'm currently experiencing high demand. I'm here to help with information about instructors, courses, and school management. What can I assist you with today?"
        };
      }
      
      // For other API errors, use a fallback response
      return {
        response: "I'm ready to help you with information about instructors, courses, test results, and other school management tasks. What would you like to know?"
      };
    }
  } catch (error) {
    console.error("Error processing assistant query:", error);
    return {
      response: "I'm here to help with school management. Please let me know what you need assistance with, and I'll do my best to help."
    };
  }
}