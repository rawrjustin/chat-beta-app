import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types/api';
import { sendChatMessage } from '../utils/api';
import mixpanel from 'mixpanel-browser';

export function useChat(configId: string) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Track AI Prompt Sent event
      mixpanel.track('AI Prompt Sent and Prompt Text', {
        'Prompt Text': userInput,
      });

      // Track Launch AI event on first message
      if (messages.length === 0) {
        mixpanel.track('Launch AI');
      }

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const startTime = Date.now();
      try {
        const response = await sendChatMessage(sessionId || '', configId, userInput);
        const responseTime = Date.now() - startTime;

        // Update session ID if we didn't have one
        if (!sessionId && response.session_id) {
          setSessionId(response.session_id);
        }

        // Track AI Response Sent event
        mixpanel.track('AI Response Sent', {
          'API Response Time': responseTime,
        });

        // Add AI response to UI
        const aiMessage: ChatMessage = {
          role: 'ai',
          content: response.ai,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        
        // Track API Error event
        mixpanel.track('API Error', {
          error_type: 'api',
          error_message: errorMessage,
        });
        
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, configId, isLoading, messages.length]
  );

  const startNewConversation = useCallback(() => {
    setSessionId('');
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
  };
}

