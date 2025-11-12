import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, SuggestedPreprompt } from '../types/api';
import { sendChatMessage } from '../utils/api';
import mixpanel from 'mixpanel-browser';
import { saveChatSession, loadChatSession, clearChatSession } from '../utils/storage';

export function useChat(configId: string) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPreprompt[]>([]);

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

        // Update session ID from response (server may create or update it)
        if (response.session_id) {
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
        
        // Update suggested prompts
        const newPrompts = response.preprompts ?? [];
        setSuggestedPrompts(newPrompts);
        
        // Track Pre Prompts Refreshed event with all 4 prompts
        const refreshEventProperties: Record<string, string> = {};
        for (let i = 0; i < 4; i++) {
          const prompt = newPrompts[i];
          if (prompt) {
            refreshEventProperties[`prompt_${i + 1}_type`] = prompt.type;
            refreshEventProperties[`prompt_${i + 1}_prompt_text`] = prompt.prompt;
            refreshEventProperties[`prompt_${i + 1}_simplified_text`] = prompt.simplified_text;
          }
        }
        mixpanel.track('Pre Prompts Refreshed', refreshEventProperties);
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
        setSuggestedPrompts([]);
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
    setSuggestedPrompts([]);
    // Clear saved session from local storage
    if (configId) {
      clearChatSession(configId);
    }
  }, [configId]);

  const clearSuggestedPrompts = useCallback(() => {
    setSuggestedPrompts([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
    suggestedPrompts,
    clearSuggestedPrompts,
  };
}

