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
      // The history needs to be in ChatCompletionMessageParam format for OpenAI
      const conversation = messages.map(({ role, content }) => ({
        role: role === 'user' ? 'user' : 'assistant', 
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
        console.log('Sending message to Moon Assistant with conversation length:', conversation.length);
        
        const response = await apiRequest('POST', '/api/moons-assistant/chat', {
          message,
          conversation,
        });
        
        // Check for non-JSON responses (like HTML error pages)
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response from Moon Assistant API:', contentType);
          throw new Error('Received non-JSON response from server. Please try again.');
        }
        
        // Safely try to parse JSON response
        let responseText = '';
        try {
          responseText = await response.text();
          console.log('Raw response text:', responseText.substring(0, 100));
          
          // Manually parse JSON to handle both standard and non-standard formats
          const responseData: MoonsAssistantResponse = JSON.parse(responseText);
          console.log('Moon Assistant response:', responseData);
          
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
            console.error('Moon Assistant error response:', responseData.error);
            throw new Error(responseData.error || 'Failed to get response from Moon\'s Assistant');
          }
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError, 'Raw response:', responseText);
          throw new Error('Invalid response format from server. Please try again.');
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
    onError: (error: Error) => {
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