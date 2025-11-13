import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ChatMessage,
  SuggestedPreprompt,
  InitialMessageHistoryMessage,
} from '../types/api';
import { createSession, fetchInitialMessage, sendChatMessage } from '../utils/api';
import mixpanel from 'mixpanel-browser';
import { saveChatSession, loadChatSession, clearChatSession } from '../utils/storage';

const mapChatMessageToHistory = ({
  role,
  content,
}: ChatMessage): InitialMessageHistoryMessage => ({
  role: role === 'ai' ? 'assistant' : 'user',
  content,
});

export function useChat(configId: string) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPreprompt[]>([]);
  const [hasFetchedInitialMessage, setHasFetchedInitialMessage] = useState(false);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const initialFetchInProgressRef = useRef(false);

  // Load saved chat session on mount or when changing characters
  useEffect(() => {
    if (!configId) {
      setSessionId('');
      setMessages([]);
      setSuggestedPrompts([]);
      setError(null);
      setIsLoading(false);
      setHasFetchedInitialMessage(false);
      setHasAttemptedRestore(false);
      initialFetchInProgressRef.current = false;
      return;
    }

    const savedChat = loadChatSession(configId);
    if (savedChat) {
      setSessionId(savedChat.sessionId);
      setMessages(savedChat.messages);
      setHasFetchedInitialMessage(false);
      console.log('Loaded saved chat session:', {
        configId,
        sessionId: savedChat.sessionId,
        messageCount: savedChat.messages.length,
      });
    } else {
      setSessionId('');
      setMessages([]);
      setHasFetchedInitialMessage(false);
    }

    setSuggestedPrompts([]);
    setError(null);
    setIsLoading(false);
    setHasAttemptedRestore(true);
    initialFetchInProgressRef.current = false;
  }, [configId]);

  // Save chat session whenever messages or sessionId changes
  useEffect(() => {
    if (!configId) return;
    
    // Only save if we have messages or a session ID
    if (messages.length > 0 || sessionId) {
      saveChatSession(configId, sessionId, messages);
    }
  }, [configId, sessionId, messages]);

  // Sync backend session ID with Mixpanel user identity
  useEffect(() => {
    if (!sessionId) {
      return;
    }

    mixpanel.identify(sessionId);
    mixpanel.register({ session_id: sessionId });
  }, [sessionId]);

  const initializeChat = useCallback(async () => {
    if (!configId) {
      return;
    }

    if (initialFetchInProgressRef.current) {
      return;
    }

    initialFetchInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const session = await createSession(configId);
        activeSessionId = session.session_id;
        setSessionId(activeSessionId);
      }

      const previousMessagesPayload = messages.slice(-5).map(mapChatMessageToHistory);

      const startTime = Date.now();
      const response = await fetchInitialMessage(
        activeSessionId,
        configId,
        previousMessagesPayload.length > 0 ? previousMessagesPayload : undefined
      );
      const responseTime = Date.now() - startTime;

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      const aiMessage: ChatMessage = {
        role: 'ai',
        content: response.ai,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
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
      setHasFetchedInitialMessage(true);
      initialFetchInProgressRef.current = false;
    }
  }, [configId, messages, sessionId]);

  useEffect(() => {
    if (!configId || !hasAttemptedRestore) {
      return;
    }

    if (hasFetchedInitialMessage) {
      return;
    }

    void initializeChat();
  }, [configId, hasAttemptedRestore, hasFetchedInitialMessage, initializeChat]);

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

      const conversationHistory: InitialMessageHistoryMessage[] = messages
        .slice(-8)
        .map(mapChatMessageToHistory);

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

        const response = await sendChatMessage(
          activeSessionId,
          configId,
          userInput,
          conversationHistory
        );
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
    setHasFetchedInitialMessage(false);
    setHasAttemptedRestore(true);
    setIsLoading(false);
    initialFetchInProgressRef.current = false;
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

