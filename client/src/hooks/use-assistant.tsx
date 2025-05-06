import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type AssistantResponse = {
  success: boolean;
  response: string;
  toolCalls?: any[];
  toolResults?: any[];
  error?: string;
};

export function useAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async (query: string) => {
      // Create a conversation context from our chat history
      const conversationContext = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      // Add user message to the chat history immediately
      const userMessage: AssistantMessage = {
        role: 'user',
        content: query,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await apiRequest('POST', '/api/assistant/query', {
          query,
          conversationContext,
        });
        
        const responseData: AssistantResponse = await response.json();
        
        // Add the assistant's response to the chat history
        if (responseData.success) {
          const assistantMessage: AssistantMessage = {
            role: 'assistant',
            content: responseData.response,
            timestamp: Date.now(),
          };
          
          setMessages((prev) => [...prev, assistantMessage]);
          return responseData;
        } else {
          throw new Error(responseData.error || 'Failed to get response from assistant');
        }
      } catch (error) {
        // If there's an error, add an error message to the chat
        const errorMessage: AssistantMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: Date.now(),
        };
        
        setMessages((prev) => [...prev, errorMessage]);
        throw error;
      } finally {
        setIsTyping(false);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to get a response: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      return sendMessageMutation.mutateAsync(message);
    },
    [sendMessageMutation]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    isLoading: sendMessageMutation.isPending,
  };
}