import OpenAI from "openai";
import { AIChatMessage } from "../../client/src/lib/ai-types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Get a response from the OpenAI API
 * 
 * Note: the newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
 * Do not change this unless explicitly requested by the user.
 */
export async function getOpenAIResponse(
  messages: AIChatMessage[],
  context?: string
): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set, using fallback response");
      return "I don't have access to OpenAI API at the moment. Please try a different question or come back later.";
    }

    const systemPrompt = {
      role: "system",
      content: `You are an AI assistant for the GOVCIO/SAMS ELT Program, a school management system for aviation training.
      Be precise, concise, helpful, and professional.
      
      Key information about the GOVCIO/SAMS ELT Program:
      - Manages three schools: KNFA, NFS East, and NFS West
      - Each school has 20 male ELT instructors with nationalities including American, British, and Canadian
      - Instructors live in two compounds: "Al Reem" and "Saken"
      - Instructor evaluation passing threshold is 85% (scores >=85% display as green, <85% as red)
      - The system tracks test results including ALCPT, Book tests, and ECL tests
      - Each school has distinct visualization colors: KNFA (blue), NFS East (green), NFS West (orange)
      
      ${context ? `Additional context information: ${context}` : ""}`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        systemPrompt as any, 
        ...messages.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        }))
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "I encountered an error processing your request with OpenAI. Please try again later.";
  }
}

/**
 * Enhanced version of OpenAI that can analyze data and provide insights
 */
export async function getAdvancedAnalysis(
  messages: AIChatMessage[],
  context: string,
  dataToAnalyze: string
): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set, using fallback response");
      return "I don't have access to OpenAI API for data analysis at the moment.";
    }

    const systemPrompt = {
      role: "system",
      content: `You are an AI data analyst for the GOVCIO/SAMS ELT Program, a school management system for aviation training.
      You are skilled at analyzing data, finding patterns, and providing clear explanations.
      
      Key information about the GOVCIO/SAMS ELT Program:
      - Manages three schools: KNFA, NFS East, and NFS West
      - Each school has 20 male ELT instructors from various nationalities
      - Instructor evaluation passing threshold is 85% (scores >=85% display as green, <85% as red)
      - Evaluation scores are tracked quarterly
      - The system tracks test results including ALCPT, Book tests, and ECL tests
      
      The user has requested analysis of the following data:
      ${dataToAnalyze}
      
      ${context ? `Additional context information: ${context}` : ""}`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        systemPrompt as any, 
        ...messages.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        }))
      ],
      temperature: 0.1,
      max_tokens: 1200,
    });

    return response.choices[0].message.content || "I couldn't analyze this data. Please try again.";
  } catch (error) {
    console.error("Error calling OpenAI API for data analysis:", error);
    return "I encountered an error analyzing this data with OpenAI. Please try again later.";
  }
}