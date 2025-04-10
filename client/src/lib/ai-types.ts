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