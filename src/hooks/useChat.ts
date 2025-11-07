import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../types/api';
import { sendChatMessage } from '../utils/api';
import { saveChatSession, loadChatSession, clearChatSession } from '../utils/storage';

export function useChat(configId: string) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved chat session on mount
  useEffect(() => {
    if (!configId) return;

    const savedChat = loadChatSession(configId);
    if (savedChat) {
      setSessionId(savedChat.sessionId);
      setMessages(savedChat.messages);
      console.log('Loaded saved chat session:', {
        configId,
        sessionId: savedChat.sessionId,
        messageCount: savedChat.messages.length,
      });
    }
  }, [configId]);

  // Save chat session whenever messages or sessionId changes
  useEffect(() => {
    if (!configId) return;
    
    // Only save if we have messages or a session ID
    if (messages.length > 0 || sessionId) {
      saveChatSession(configId, sessionId, messages);
    }
  }, [configId, sessionId, messages]);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await sendChatMessage(sessionId || '', configId, userInput);

        // Update session ID from response (server may create or update it)
        if (response.session_id) {
          setSessionId(response.session_id);
        }

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
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, configId, isLoading]
  );

  const startNewConversation = useCallback(() => {
    setSessionId('');
    setMessages([]);
    setError(null);
    // Clear saved session from local storage
    if (configId) {
      clearChatSession(configId);
    }
  }, [configId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
  };
}

