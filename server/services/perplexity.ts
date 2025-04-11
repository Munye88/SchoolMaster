import { AIChatMessage } from "../../client/src/lib/ai-types";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Interface for a chat request to Perplexity API
 */
interface PerplexityChatRequest {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  temperature: number;
  top_p: number;
  max_tokens?: number;
  stream: boolean;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  frequency_penalty?: number;
}

/**
 * Interface for Perplexity API response
 */
interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
  citations?: string[];
}

/**
 * Get a response from the Perplexity API
 */
export async function getPerplexityResponse(
  messages: AIChatMessage[],
  context?: string
): Promise<string> {
  try {
    if (!PERPLEXITY_API_KEY) {
      console.warn("PERPLEXITY_API_KEY not set, using fallback response");
      return "I don't have access to Perplexity API at the moment. Please try a different question or come back later.";
    }

    // Construct the request body with system prompt including context
    const requestBody: PerplexityChatRequest = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for the GOVCIO/SAMS ELT Program, a school management system for aviation training. 
          Be precise, concise, and professional. 
          ${context ? `Use this context to inform your responses: ${context}` : ""}`,
        },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.2,
      top_p: 0.9,
      stream: false,
      frequency_penalty: 1,
      return_images: false,
      return_related_questions: false,
    };

    // Make the API request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", errorText);
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as PerplexityResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    return "I encountered an error processing your request. Please try again later.";
  }
}