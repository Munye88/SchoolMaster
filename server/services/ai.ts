import { AIChatRequest, AIChatResponse } from "../../client/src/lib/ai-types";
import fetch from "node-fetch";

// Use Perplexity API instead of OpenAI
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Default to the sonar-small model which has good capabilities but lower cost
const MODEL = "llama-3.1-sonar-small-128k-online";

/**
 * Generates an AI response using Perplexity API
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
    
    // Call Perplexity API
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Perplexity API error:", errorData);
      throw new Error(`Perplexity API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the response
    return {
      message: {
        role: "assistant",
        content: data.choices[0].message.content || "I'm sorry, I couldn't generate a response."
      }
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      message: {
        role: "assistant",
        content: "I'm currently experiencing technical difficulties. Please try again later."
      }
    };
  }
}