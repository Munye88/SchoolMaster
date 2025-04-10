import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. AI features will not work properly.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIChatRequest {
  messages: AIChatMessage[];
  schoolId?: number;
  dataContext?: string;
}

export interface AIChatResponse {
  message: AIChatMessage;
  schoolId?: number;
}

export async function generateAIResponse(
  request: AIChatRequest
): Promise<AIChatResponse> {
  try {
    // Prepare system message with context about the application
    const systemMessage: AIChatMessage = {
      role: "system",
      content: `You are an AI assistant for the GOVCIO/SAMS ELT Program school management system. 
You help administrators and staff with data analysis, report summaries, and answering questions about students, 
instructors, courses, and test results.

The system manages three schools: KNFA, NFS East, and NFS West. Each school has 20 male ELT instructors.
Courses include Aviation (1 year, ALCPT 80, ECL 80, OPI 2/2), Refresher (6 months, ALCPT 55), 
MMSC (6 months, ALCPT 45), and Cadets.

Test types include ALCPT, Book test, and ECL. Staff evaluation has 85% as the passing score.

Current Context: ${request.dataContext || "No specific data context provided."}

Be concise, accurate, and helpful in your responses. Provide specific data when available.`,
    };

    // Add system message at the beginning if not already present
    const messages = [
      systemMessage,
      ...request.messages.filter((msg) => msg.role !== "system"),
    ];

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      message: {
        role: "assistant",
        content: response.choices[0].message.content || "I couldn't generate a response.",
      },
      schoolId: request.schoolId,
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      message: {
        role: "assistant",
        content:
          "I'm sorry, I encountered an error while processing your request. Please try again later.",
      },
      schoolId: request.schoolId,
    };
  }
}