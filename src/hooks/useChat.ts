import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, SuggestedPreprompt } from '../types/api';
import { createSession, fetchInitialMessage, sendChatMessage } from '../utils/api';
import mixpanel from 'mixpanel-browser';
import { saveChatSession, loadChatSession, clearChatSession } from '../utils/storage';

export function useChat(configId: string) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPreprompt[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);

  // Load saved chat session on mount or when changing characters
  useEffect(() => {
    if (!configId) {
      setSessionId('');
      setMessages([]);
      setSuggestedPrompts([]);
      setError(null);
      setIsLoading(false);
      setHasInitialized(false);
      setHasAttemptedRestore(false);
      return;
    }

    const savedChat = loadChatSession(configId);
    if (savedChat) {
      setSessionId(savedChat.sessionId);
      setMessages(savedChat.messages);
      setHasInitialized(savedChat.messages.length > 0);
      console.log('Loaded saved chat session:', {
        configId,
        sessionId: savedChat.sessionId,
        messageCount: savedChat.messages.length,
      });
    } else {
      setSessionId('');
      setMessages([]);
      setHasInitialized(false);
    }

    setSuggestedPrompts([]);
    setError(null);
    setIsLoading(false);
    setHasAttemptedRestore(true);
  }, [configId]);

  // Save chat session whenever messages or sessionId changes
  useEffect(() => {
    if (!configId) return;
    
    // Only save if we have messages or a session ID
    if (messages.length > 0 || sessionId) {
      saveChatSession(configId, sessionId, messages);
    }
  }, [configId, sessionId, messages]);

  const initializeChat = useCallback(async () => {
    if (!configId) {
      return;
    }

    if (messages.length > 0) {
      setHasInitialized(true);
      return;
    }

    if (hasInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const session = await createSession(configId);
        activeSessionId = session.session_id;
        setSessionId(activeSessionId);
      }

      const startTime = Date.now();
      const response = await fetchInitialMessage(activeSessionId, configId);
      const responseTime = Date.now() - startTime;

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      const aiMessage: ChatMessage = {
        role: 'ai',
        content: response.ai,
        timestamp: new Date(),
      };

      setMessages((prev) => (prev.length === 0 ? [aiMessage] : prev));
      setSuggestedPrompts(response.preprompts ?? []);

      mixpanel.track('AI Initial Message', {
        'API Response Time': responseTime,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load initial message';
      setError(errorMessage);
      mixpanel.track('API Error', {
        error_type: 'initial_message',
        error_message: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [configId, hasInitialized, messages.length, sessionId]);

  useEffect(() => {
    if (!configId || !hasAttemptedRestore) {
      return;
    }

    if (hasInitialized) {
      return;
    }

    if (messages.length > 0) {
      setHasInitialized(true);
      return;
    }

    void initializeChat();
  }, [configId, hasAttemptedRestore, hasInitialized, messages.length, initializeChat]);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Track AI Prompt Sent event
      mixpanel.track('AI Prompt Sent and Prompt Text', {
        'Prompt Text': userInput,
      });

      const hasUserMessage = messages.some((message) => message.role === 'user');
      if (!hasUserMessage) {
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
        let activeSessionId = sessionId;

        if (!activeSessionId) {
          const session = await createSession(configId);
          activeSessionId = session.session_id;
          setSessionId(activeSessionId);
        }

        const response = await sendChatMessage(activeSessionId, configId, userInput);
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
        setSuggestedPrompts(response.preprompts ?? []);
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
    [sessionId, configId, isLoading, messages]
  );

  const startNewConversation = useCallback(() => {
    setSessionId('');
    setMessages([]);
    setError(null);
    setSuggestedPrompts([]);
    setHasInitialized(false);
    setHasAttemptedRestore(true);
    setIsLoading(false);
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

