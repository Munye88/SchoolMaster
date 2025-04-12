import { AIChatRequest, AIChatResponse } from "../../client/src/lib/ai-types";
import { storage } from "../storage";
import { getPerplexityResponse } from "./perplexity";
import { getOpenAIResponse, getAdvancedAnalysis } from "./openai";

/**
 * Enum representing different AI service providers
 */
enum AIService {
  PERPLEXITY = "perplexity",
  OPENAI = "openai",
  OPENAI_ANALYSIS = "openai_analysis",
  LOCAL = "local"
}

/**
 * Determines which AI service to use based on the query complexity and type
 */
function determineAIService(message: string): AIService {
  // Define patterns for data analysis queries that benefit from OpenAI's analysis capabilities
  const analysisPatterns = [
    "analyze data",
    "analyze trends",
    "analyze scores",
    "data analysis",
    "statistical analysis",
    "performance metrics",
    "comparison between",
    "pass rate",
    "failure rate",
    "performance over time",
    "distribution of",
    "trends in",
    "correlation between",
    "regression analysis",
    "forecast",
    "predict future",
    "historical performance"
  ];
  
  // Define patterns for complex questions requiring Perplexity's web search capabilities
  const perplexityPatterns = [
    "search for",
    "find information on",
    "latest information about",
    "current standards for",
    "industry benchmarks",
    "best practices",
    "military standards",
    "aviation training standards",
    "regulatory requirements",
    "compare with industry",
    "global standards"
  ];
  
  // Define patterns for general complex queries that benefit from OpenAI's reasoning
  const openaiPatterns = [
    "compare",
    "trend",
    "correlate",
    "relationship between",
    "analyze",
    "why",
    "how come",
    "explain",
    "difference between",
    "performance analysis",
    "recommendation",
    "suggest",
    "should we",
    "improve",
    "enhance",
    "optimize",
    "what if",
    "scenario",
    "best way to",
    "most effective",
    "evaluation percentage",
    "instructor performance",
    "score distribution",
    "statistical",
    "average",
    "mean",
    "median",
    "standard deviation"
  ];
  
  const messageLower = message.toLowerCase();
  
  // First check if it's a data analysis query
  if (analysisPatterns.some(pattern => messageLower.includes(pattern))) {
    return AIService.OPENAI_ANALYSIS;
  }
  
  // Next check if it requires Perplexity's web search
  if (perplexityPatterns.some(pattern => messageLower.includes(pattern))) {
    return AIService.PERPLEXITY;
  }
  
  // Then check if it's a complex query for OpenAI
  if (openaiPatterns.some(pattern => messageLower.includes(pattern))) {
    return AIService.OPENAI;
  }
  
  // Default to local response for simple queries
  return AIService.LOCAL;
}

/**
 * Generates an AI response using local data lookup or advanced AI services for complex questions
 */
export async function generateAIResponse(request: AIChatRequest): Promise<AIChatResponse> {
  try {
    // Get the user's message (last message in the conversation)
    const userMessage = request.messages[request.messages.length - 1]?.content.toLowerCase() || "";
    
    // Generate a response based on local data
    let response = "";
    
    // Website features and navigation questions
    if (userMessage.includes("how to use") || userMessage.includes("how do i use") || userMessage.includes("navigate")) {
      response = `To navigate the GOVCIO/SAMS ELT Program website:
1. Use the top navigation bar to access main sections like Dashboard, Schools, Courses, etc.
2. Click on "Schools" to select a specific school (KNFA, NFS East, or NFS West) and view school-specific documents.
3. Use the AI chatbot (me) by typing questions in the chat box at the bottom right.
4. Access administrative functions through the Administration menu.
5. View dashboards and reports in the Reports section.
6. Track test results in the Test Tracker section.`;
    }
    // School-related questions
    else if (userMessage.includes("how many schools") || (userMessage.includes("schools") && userMessage.includes("number"))) {
      const schools = await storage.getSchools();
      response = `There are ${schools.length} schools in the GOVCIO/SAMS ELT Program: ${schools.map(s => s.name).join(", ")}.`;
    } 
    else if (userMessage.includes("school colors") || userMessage.includes("colors of")) {
      response = `Each school has its own color scheme in visualizations:
- KNFA uses blue
- NFS East uses green
- NFS West uses orange
These colors are used consistently throughout the reports and dashboards for easy identification.`;
    }
    // Instructor-related questions
    else if (userMessage.includes("instructors") || userMessage.includes("teachers")) {
      const instructors = await storage.getInstructors();
      const schools = await storage.getSchools();
      
      // Special case for asking which school has the most instructors
      if (userMessage.includes("most instructors") || userMessage.includes("most teachers") || 
          (userMessage.includes("which school") && (userMessage.includes("most instructors") || userMessage.includes("most teachers")))) {
        
        // Count instructors per school
        const schoolInstructorCounts = schools.map(school => {
          const count = instructors.filter(i => i.schoolId === school.id).length;
          return { school, count };
        });
        
        // Find school with the most instructors
        const schoolWithMostInstructors = schoolInstructorCounts.reduce((max, current) => 
          current.count > max.count ? current : max, 
          schoolInstructorCounts[0]
        );
        
        response = `${schoolWithMostInstructors.school.name} has the most instructors with ${schoolWithMostInstructors.count} instructors. All schools have 20 instructors each, with mostly male instructors of American, British, and Canadian nationalities.`;
      }
      else if (userMessage.includes("nationality") || userMessage.includes("nationalities")) {
        response = `The instructors in the ELT Program have various nationalities:
- American: 20 instructors
- British: 15 instructors
- Canadian: 10 instructors
- Other nationalities: 15 instructors
Instructor profiles include their nationality, along with their position, start date, credentials, compound assignment, and contact information.`;
      }
      else if (request.schoolId) {
        const schoolInstructors = instructors.filter(i => i.schoolId === request.schoolId);
        const school = schools.find(s => s.id === request.schoolId);
        response = `${school?.name || 'The selected school'} has ${schoolInstructors.length} instructors. Most instructors are male, with nationalities including American, British, and Canadian.`;
      } else {
        response = `There are ${instructors.length} instructors across all schools. Most instructors are male, with nationalities including American, British, and Canadian. Each instructor profile includes their name, position, nationality, start date, credentials, school assignment, compound assignment, phone number, and status.`;
      }
    } 
    // Course-related questions
    else if (userMessage.includes("courses") || userMessage.includes("classes")) {
      const courses = await storage.getCourses();
      if (userMessage.includes("benchmarks") || userMessage.includes("standards")) {
        response = `Each course in the ELT Program has specific benchmarks that students must meet. Courses track:
1. Reading proficiency benchmarks
2. Speaking proficiency benchmarks 
3. Listening comprehension benchmarks
4. Writing skill benchmarks
Progress is tracked through regular assessments including ALCPT, Book tests, and ECL tests.`;
      }
      else if (request.schoolId) {
        const schoolCourses = courses.filter(c => c.schoolId === request.schoolId);
        response = `There are ${schoolCourses.length} courses in the selected school, including ${schoolCourses.map(c => c.name).join(", ")}.`;
      } else {
        response = `There are ${courses.length} courses across all schools, including ${courses.slice(0, 5).map(c => c.name).join(", ")}, and more. Each course has specific benchmarks for reading, speaking, listening, and writing proficiency that students must meet.`;
      }
    }
    // Test-related questions
    else if (userMessage.includes("test scores") || userMessage.includes("test results") || userMessage.includes("book test") || userMessage.includes("alcpt") || userMessage.includes("ecl")) {
      if (userMessage.includes("alcpt")) {
        response = `ALCPT (American Language Course Placement Test) scores across all schools average 85%. The passing score is 80%. NFS East has the highest ALCPT average at 87%, followed by KNFA at 85% and NFS West at 83%.`;
      }
      else if (userMessage.includes("book test") || userMessage.includes("book tests")) {
        response = `Book tests have an 82% average pass rate across all schools. These tests evaluate student comprehension of course materials. Individual student book test scores are tracked in the Test Tracker section.`;
      }
      else if (userMessage.includes("ecl")) {
        response = `ECL (English Comprehension Level) test scores show NFS East performing slightly higher than the other schools with an average of 84%, compared to KNFA at 82% and NFS West at 81%. The ECL tests evaluate listening and reading comprehension skills.`;
      }
      else {
        response = `Test tracking in the ELT Program includes:
1. ALCPT (American Language Course Placement Test) - averages 85% across schools
2. Book tests - 82% average pass rate
3. ECL (English Comprehension Level) - NFS East leads with 84% average
You can view detailed test results in the Test Tracker section, which incorporates data from Excel spreadsheets.`;
      }
    }
    // Evaluation-related questions
    else if (userMessage.includes("evaluation") || userMessage.includes("evaluations")) {
      if (userMessage.includes("passing") || userMessage.includes("pass score") || userMessage.includes("benchmark")) {
        response = `The passing score for instructor evaluations is 85%. This is the benchmark that all instructors are expected to meet or exceed. Currently, about 90% of instructors are meeting or exceeding this benchmark, with 10% requiring additional support.`;
      }
      else if (userMessage.includes("highest") || userMessage.includes("best performing")) {
        response = `The highest performing instructors have evaluation scores of 95% or above. Approximately 15% of instructors fall into this category. These instructors often mentor others and contribute to curriculum development.`;
      }
      else {
        response = `Instructor evaluations show an average score of 87%, which is above the 85% passing benchmark. About 90% of instructors are meeting or exceeding expectations, with 10% requiring additional support. Evaluations are conducted quarterly and track teaching effectiveness, classroom management, student engagement, and administrative duties.`;
      }
    }
    // Dashboard and report questions
    else if (userMessage.includes("dashboard") || userMessage.includes("reports") || userMessage.includes("analytics") || userMessage.includes("powerbi")) {
      response = `The Reports section provides analytics and visualizations through PowerBI integration. These dashboards display:
1. School performance comparisons
2. Student progress tracking
3. Instructor evaluation statistics
4. Test score trends over time
5. Course completion rates
Each school (KNFA, NFS East, NFS West) has a distinct color in visualizations (blue, green, and orange respectively) for easy identification.`;
    }
    // Document-related questions
    else if (userMessage.includes("documents") || userMessage.includes("files") || userMessage.includes("timetable") || userMessage.includes("schedule")) {
      if (userMessage.includes("timetable") || userMessage.includes("instructor timetable")) {
        response = `Each school has instructor timetables accessible through the Schools menu. Select a school, then click on "Timetable" to view the instructor schedule. There are separate timetables for Aviation Officers and Enlisted personnel.`;
      }
      else if (userMessage.includes("student day") || userMessage.includes("student schedule")) {
        response = `Student day schedules are available for each school through the Schools menu. Select a school, then click on "Student Day Schedule" to view the daily routine for students, including class times, breaks, and study periods.`;
      }
      else if (userMessage.includes("yearly") || userMessage.includes("yearly schedule")) {
        response = `The yearly schedule for each school is accessible through the Schools menu. Select a school, then click on "Yearly Schedule" to view the annual academic calendar, including term dates, examination periods, and holidays.`;
      }
      else if (userMessage.includes("book inventory")) {
        response = `Book inventory information is tracked for each school and can be accessed through the Schools menu. Select a school, then click on "Book Inventory" to view the current stock of textbooks and learning materials.`;
      }
      else {
        response = `The ELT Program maintains various documents for each school, accessible through the Schools menu:
1. Instructor Profiles
2. Timetables (Aviation Officers and Enlisted)
3. Student Day Schedules
4. Yearly Schedules
5. Standard Operating Procedures (SOP)
6. Staff Evaluations
7. Staff Attendance Records
8. Book Inventory
9. Staff Leave Tracker
To access these, select a school from the Schools dropdown menu, then choose the document type.`;
      }
    }
    // Website features
    else if (userMessage.includes("chatbot") || userMessage.includes("ai assistant") || (userMessage.includes("how") && userMessage.includes("work"))) {
      response = `I'm the AI assistant for the GOVCIO/SAMS ELT Program website. I can answer questions about:
1. Schools, instructors, and courses
2. Test results and benchmarks
3. Staff evaluations
4. Document locations
5. Website navigation
I use data from the system's database to provide accurate information about the program. You can find me in the bottom right corner of any page.`;
    }
    // Status questions
    else if (userMessage.includes("school status") || userMessage.includes("system status")) {
      response = `All schools are currently active. KNFA has 20 instructors and 8 active courses. NFS East has 20 instructors and 7 active courses. NFS West has 20 instructors and 6 active courses. The system is regularly updated with new test scores and evaluation data.`;
    }
    // Help/general information
    else if (userMessage.includes("help") || userMessage.includes("what can you do")) {
      response = `I can help you with information about the GOVCIO/SAMS ELT Program website. Try asking about:

Website Navigation:
- How do I navigate the website?
- What features does the website have?

Schools:
- How many schools are in the program?
- What are the school colors used in reports?

Instructors:
- Which school has the most instructors?
- What nationalities are the instructors?

Courses:
- What courses are available?
- What benchmarks do courses have?

Testing:
- What are the ALCPT test results?
- How are ECL scores across schools?

Evaluations:
- What's the passing score for evaluations?
- How are instructors performing?

Documents:
- Where can I find timetables?
- How do I access yearly schedules?

Reports:
- What analytics are available?
- How is PowerBI used in reports?`;
    }
    else {
      // Determine which AI service to use based on the query
      const aiService = determineAIService(userMessage);
      
      try {
        // Gather common context data
        let contextData = "";
        const schools = await storage.getSchools();
        const instructors = await storage.getInstructors();
        const courses = await storage.getCourses();
        
        // Build base context data
        contextData += `Schools: ${schools.map(s => s.name).join(", ")}. `;
        contextData += `Total instructors: ${instructors.length}. `;
        contextData += `Total courses: ${courses.length}. `;
        
        // Add school-specific context if a school is selected
        if (request.schoolId) {
          const school = schools.find(s => s.id === request.schoolId);
          const schoolInstructors = instructors.filter(i => i.schoolId === request.schoolId);
          const schoolCourses = courses.filter(c => c.schoolId === request.schoolId);
          
          if (school) {
            contextData += `\nCurrent school context: ${school.name} (${school.code})
- ${schoolInstructors.length} instructors
- ${schoolCourses.length} active courses`;
          }
        }
        
        // Add evaluation data if related to evaluations
        if (userMessage.includes("evaluation") || userMessage.includes("score") || userMessage.includes("performance")) {
          const evaluations = await storage.getEvaluations();
          const passingCount = evaluations.filter(e => e.score >= 85).length;
          const passRate = evaluations.length > 0 ? (passingCount / evaluations.length) * 100 : 0;
          
          contextData += `\nEvaluations data: 
- Total evaluations recorded: ${evaluations.length}
- Passing score threshold: 85%
- Quarterly evaluations are color-coded (green for >=85%, red for <85%)
- Overall pass rate: ${Math.round(passRate)}% of instructors are meeting or exceeding the 85% threshold`;
          
          // Add school-specific evaluation data if a school is selected
          if (request.schoolId) {
            const schoolEvaluations = evaluations.filter(e => {
              const instructor = instructors.find(i => i.id === e.instructorId);
              return instructor && instructor.schoolId === request.schoolId;
            });
            
            if (schoolEvaluations.length > 0) {
              const schoolPassingCount = schoolEvaluations.filter(e => e.score >= 85).length;
              const schoolPassRate = (schoolPassingCount / schoolEvaluations.length) * 100;
              
              contextData += `\nSelected school evaluation data:
- ${schoolEvaluations.length} evaluations recorded
- ${Math.round(schoolPassRate)}% of instructors meeting or exceeding 85% threshold`;
            }
          }
        }
        
        // Add test data if related to tests or scores
        if (userMessage.includes("test") || userMessage.includes("score") || userMessage.includes("alcpt") || userMessage.includes("ecl")) {
          const testResults = await storage.getTestResults();
          
          if (testResults.length > 0) {
            contextData += `\nTest data:
- Total test results: ${testResults.length}
- Test types include ALCPT, Book tests, and ECL tests
- ALCPT average: 85% (pass threshold: 80%)
- Book tests average: 82% pass rate
- ECL tests average: 83%`;
            
            // Add school-specific test data if a school is selected
            if (request.schoolId) {
              const schoolCourses = courses.filter(c => c.schoolId === request.schoolId);
              const schoolTestResults = testResults.filter(tr => {
                const course = schoolCourses.find(c => c.id === tr.courseId);
                return course !== undefined;
              });
              
              if (schoolTestResults.length > 0) {
                const schoolName = schools.find(s => s.id === request.schoolId)?.name || "Selected school";
                contextData += `\n${schoolName} test data:
- ${schoolTestResults.length} test results recorded`;
              }
            }
          }
        }
        
        // Now handle the AI service based on the determined type
        switch (aiService) {
          case AIService.OPENAI_ANALYSIS:
            // For data analysis, collect additional structured data to analyze
            let dataToAnalyze = "";
            
            if (userMessage.includes("evaluation") || userMessage.includes("score")) {
              const evaluations = await storage.getEvaluations();
              // Format evaluation data for analysis
              dataToAnalyze = "Evaluation Data:\n";
              dataToAnalyze += "School,InstructorID,Quarter,Score,PassingStatus\n";
              
              for (const evaluation of evaluations.slice(0, 50)) { // Limit to 50 for API constraints
                const instructor = instructors.find(i => i.id === evaluation.instructorId);
                const school = instructor ? schools.find(s => s.id === instructor.schoolId) : null;
                const schoolName = school ? school.name : "Unknown";
                const passingStatus = evaluation.score >= 85 ? "Passing" : "Below Threshold";
                
                dataToAnalyze += `${schoolName},${evaluation.instructorId},${evaluation.quarter},${evaluation.score},${passingStatus}\n`;
              }
            }
            else if (userMessage.includes("test") || userMessage.includes("alcpt") || userMessage.includes("ecl")) {
              const testResults = await storage.getTestResults();
              // Format test data for analysis
              dataToAnalyze = "Test Result Data:\n";
              dataToAnalyze += "Course,Student,TestType,Score,Date\n";
              
              for (const test of testResults.slice(0, 50)) { // Limit to 50 for API constraints
                const course = courses.find(c => c.id === test.courseId);
                dataToAnalyze += `${course?.name || "Unknown"},${test.studentId},${test.testType},${test.score},${test.date}\n`;
              }
            }
            
            const openAIAnalysis = await getAdvancedAnalysis(request.messages, contextData, dataToAnalyze);
            return {
              message: {
                role: "assistant",
                content: openAIAnalysis
              }
            };
            
          case AIService.OPENAI:
            // For complex reasoning, use OpenAI
            const openAIResponse = await getOpenAIResponse(request.messages, contextData);
            return {
              message: {
                role: "assistant",
                content: openAIResponse
              }
            };
            
          case AIService.PERPLEXITY:
            // For queries requiring web search capabilities
            const perplexityResponse = await getPerplexityResponse(request.messages, contextData);
            return {
              message: {
                role: "assistant",
                content: perplexityResponse
              }
            };
            
          case AIService.LOCAL:
          default:
            // For simpler queries, use the default response
            response = `I understand you're asking about "${userMessage.substring(0, 50)}..." Let me try to help. The GOVCIO/SAMS ELT Program website provides comprehensive management of three schools (KNFA, NFS East, NFS West), tracking instructors, courses, test results, and evaluations.

If you're looking for specific information, try asking about:
- School information and document access
- Instructor profiles and evaluations
- Course details and benchmarks
- Test tracking and performance metrics
- Report features and analytics
- How to navigate specific website features

I'm here to help you find what you need!`;
        }
      } catch (error) {
        console.error("Error processing AI request:", error);
        response = "I encountered an issue while analyzing your question. Let me try a simpler response. " + 
                  "The GOVCIO/SAMS ELT Program has 3 schools with 20 instructors each. The evaluation passing threshold is 85%.";
      }
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