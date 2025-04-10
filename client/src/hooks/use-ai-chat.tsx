import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AIChatMessage, AIChatRequest, AIChatResponse } from "@/lib/ai-types";
import { apiRequest } from "@/lib/queryClient";
import { useSchool } from "./useSchool";

export function useAIChat() {
  const { toast } = useToast();
  const { selectedSchool } = useSchool();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);

  const mutation = useMutation({
    mutationFn: async (chatRequest: AIChatRequest) => {
      const res = await apiRequest("POST", "/api/ai/chat", chatRequest);
      return (await res.json()) as AIChatResponse;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to get AI response: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const sendMessage = (content: string) => {
    // Add user message to the messages array
    const userMessage: AIChatMessage = {
      role: "user",
      content,
    };
    
    // Add to messages array
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Prepare request
    const request: AIChatRequest = {
      messages: updatedMessages,
      schoolId: selectedSchool?.id,
    };
    
    // Send request to API
    mutation.mutate(request, {
      onSuccess: (data) => {
        // Add the AI's response to the messages array
        setMessages(prevMessages => [...prevMessages, data.message]);
      },
    });
  };
  
  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isTyping: mutation.isPending,
    sendMessage,
    clearChat,
  };
}