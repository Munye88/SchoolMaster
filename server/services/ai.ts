import { AIChatRequest, AIChatResponse } from "../../client/src/lib/ai-types";
import { storage } from "../storage";

/**
 * Generates an AI response using local data lookup
 */
export async function generateAIResponse(request: AIChatRequest): Promise<AIChatResponse> {
  try {
    // Get the user's message (last message in the conversation)
    const userMessage = request.messages[request.messages.length - 1]?.content.toLowerCase() || "";
    
    // Generate a response based on local data
    let response = "";
    
    // Look up relevant information in the database
    if (userMessage.includes("how many schools")) {
      const schools = await storage.getSchools();
      response = `There are ${schools.length} schools in the GOVCIO/SAMS ELT Program: ${schools.map(s => s.name).join(", ")}.`;
    } 
    else if (userMessage.includes("instructors") || userMessage.includes("teachers")) {
      const instructors = await storage.getInstructors();
      const schools = await storage.getSchools();
      
      if (request.schoolId) {
        const schoolInstructors = instructors.filter(i => i.schoolId === request.schoolId);
        const school = schools.find(s => s.id === request.schoolId);
        response = `${school?.name || 'The selected school'} has ${schoolInstructors.length} instructors. Most instructors are male, with nationalities including American, British, and Canadian.`;
      } else {
        response = `There are ${instructors.length} instructors across all schools. Most instructors are male, with nationalities including American, British, and Canadian.`;
      }
    } 
    else if (userMessage.includes("courses")) {
      const courses = await storage.getCourses();
      if (request.schoolId) {
        const schoolCourses = courses.filter(c => c.schoolId === request.schoolId);
        response = `There are ${schoolCourses.length} courses in the selected school, including ${schoolCourses.map(c => c.name).join(", ")}.`;
      } else {
        response = `There are ${courses.length} courses across all schools, including ${courses.slice(0, 5).map(c => c.name).join(", ")}, and more.`;
      }
    }
    else if (userMessage.includes("test scores") || userMessage.includes("test results") || userMessage.includes("book test") || userMessage.includes("alcpt") || userMessage.includes("ecl")) {
      response = `ALCPT (American Language Course Placement Test) scores average 85% across all schools. Book tests have an 82% average pass rate. ECL (English Comprehension Level) test scores show NFS East performing slightly higher than the other schools.`;
    }
    else if (userMessage.includes("evaluation") || userMessage.includes("evaluations")) {
      response = `Instructor evaluations show an average score of 87%, which is above the 85% passing benchmark. About 90% of instructors are meeting or exceeding expectations, with 10% requiring additional support.`;
    }
    else if (userMessage.includes("school status") || userMessage.includes("system status")) {
      response = `All schools are currently active. KNFA has 20 instructors and 8 active courses. NFS East has 20 instructors and 7 active courses. NFS West has 20 instructors and 6 active courses.`;
    }
    else if (userMessage.includes("help") || userMessage.includes("what can you do")) {
      response = `I can provide information about the GOVCIO/SAMS ELT Program schools, instructors, courses, test results, and evaluations. Try asking about:
- How many schools are there?
- Tell me about the instructors
- What courses are available?
- What are the test scores like?
- How are instructor evaluations looking?
- What's the status of each school?`;
    }
    else {
      // Default response if we don't understand the question
      response = `I understand you're asking about "${userMessage.substring(0, 50)}..." but I don't have specific information on that topic. I can provide information about schools, instructors, courses, test results, and evaluations. Try asking a more specific question about one of these topics.`;
    }
    
    return {
      message: {
        role: "assistant",
        content: response
      }
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      message: {
        role: "assistant",
        content: "I apologize for the difficulty. I'm having trouble retrieving that information right now. Please try a different question or try again later."
      }
    };
  }
}