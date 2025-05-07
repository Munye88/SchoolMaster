import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

export type MoonsAssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type MoonsAssistantResponse = {
  success: boolean;
  message: string; // This is the content from the assistant
  role: string;    // This will be "assistant"
  error?: string;
};

export function useMoonsAssistant() {
  const [messages, setMessages] = useState<MoonsAssistantMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Create a conversation context from our chat history
      const conversation = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      // Add user message to the chat history immediately
      const userMessage: MoonsAssistantMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await apiRequest('POST', '/api/moons-assistant/chat', {
          message,
          conversation,
        });
        
        const responseData: MoonsAssistantResponse = await response.json();
        
        // Add the assistant's response to the chat history
        if (responseData.success) {
          const assistantMessage: MoonsAssistantMessage = {
            role: 'assistant',
            content: responseData.message,
            timestamp: Date.now(),
          };
          
          setMessages((prev) => [...prev, assistantMessage]);
          return responseData;
        } else {
          throw new Error(responseData.error || 'Failed to get response from Moon\'s Assistant');
        }
      } catch (error) {
        // If there's an error, add an error message to the chat
        const errorMessage: MoonsAssistantMessage = {
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