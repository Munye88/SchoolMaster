import OpenAI from "openai";
import { AIChatRequest, AIChatResponse } from "../../client/src/lib/ai-types";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generates an AI response using OpenAI
 */
export async function generateAIResponse(request: AIChatRequest): Promise<AIChatResponse> {
  try {
    // Prepare messages array with system prompt
    const messages = [];
    
    // Add system message with instructions and context
    messages.push({
      role: "system",
      content: `You are an AI assistant for the GOVCIO/SAMS ELT Program school management system.
Your job is to provide helpful, accurate information about the schools, instructors, students, courses, and test results.
Be concise, factual, and educational in your responses.
Use the following context information to inform your responses:
${request.dataContext || "No context available."}

When discussing test scores or evaluations:
- Be precise with numbers and percentages
- Highlight trends and notable statistics
- Compare results across schools when relevant
- Note anything that falls below expected benchmarks (85% passing score for evaluations)
- For ALCPT, Book tests, and ECL scores, explain what these tests measure in the ELT program context`
    });
    
    // Add conversation history
    request.messages.forEach(message => {
      messages.push({
        role: message.role,
        content: message.content
      });
    });
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800
    });
    
    // Return the response
    return {
      message: {
        role: "assistant",
        content: response.choices[0].message.content || "I'm sorry, I couldn't generate a response."
      }
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}