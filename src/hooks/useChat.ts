import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ChatMessage,
  SuggestedPreprompt,
  InitialMessageHistoryMessage,
  ChatMessageMetadata,
  ChatResponse,
} from '../types/api';
import {
  createSession,
  fetchInitialMessage,
  sendChatMessage,
  fetchFollowupsJob,
} from '../utils/api';
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
  const [isFetchingFollowups, setIsFetchingFollowups] = useState(false);
  const initialFetchInProgressRef = useRef(false);
  const followupsJobIdRef = useRef<string | null>(null);
  const isComponentMountedRef = useRef(true);

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  const pollFollowupsJob = useCallback(
    async (jobId: string) => {
      const MAX_ATTEMPTS = 10;
      const BASE_DELAY_MS = 800;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        if (!isComponentMountedRef.current || followupsJobIdRef.current !== jobId) {
          return;
        }

        try {
          const result = await fetchFollowupsJob(jobId);

          if (!isComponentMountedRef.current || followupsJobIdRef.current !== jobId) {
            return;
          }

          if (result.status === 'ready') {
            setSuggestedPrompts(result.preprompts ?? []);
            setIsFetchingFollowups(false);
            followupsJobIdRef.current = null;
            mixpanel.track('AI Followups Ready', {
              attempts: attempt + 1,
              followups_job_id: jobId,
            });
            return;
          }

          if (result.status === 'failed') {
            setIsFetchingFollowups(false);
            followupsJobIdRef.current = null;
            mixpanel.track('AI Followups Failed', {
              attempts: attempt + 1,
              followups_job_id: jobId,
              error_message: result.error,
            });
            console.warn('Followup generation failed', {
              jobId,
              error: result.error,
            });
            return;
          }

          const delayMs =
            result.poll_after_ms ?? Math.min(BASE_DELAY_MS * (attempt + 1), 4000);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown followup fetch error';

          if (!isComponentMountedRef.current || followupsJobIdRef.current !== jobId) {
            return;
          }

          if (attempt === MAX_ATTEMPTS - 1) {
            setIsFetchingFollowups(false);
            followupsJobIdRef.current = null;
            mixpanel.track('AI Followups Error', {
              followups_job_id: jobId,
              error_message: errorMessage,
            });
            console.error('Failed to retrieve followup suggestions:', errorMessage);
            return;
          }

          const delayMs = Math.min(BASE_DELAY_MS * (attempt + 1), 4000);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      if (!isComponentMountedRef.current || followupsJobIdRef.current !== jobId) {
        return;
      }

      setIsFetchingFollowups(false);
      followupsJobIdRef.current = null;
      mixpanel.track('AI Followups Timeout', {
        followups_job_id: jobId,
      });
      console.warn('Followup generation timed out', {
        jobId,
        attempts: MAX_ATTEMPTS,
      });
    },
    []
  );

  const handleFollowupsFromResponse = useCallback(
    (response: ChatResponse, { preserveExisting }: { preserveExisting?: boolean } = {}) => {
      if (!isComponentMountedRef.current) {
        return;
      }

      const hasInlineFollowups =
        Array.isArray(response.preprompts) && response.preprompts.length > 0;

      if (hasInlineFollowups) {
        followupsJobIdRef.current = null;
        setSuggestedPrompts(response.preprompts ?? []);
        setIsFetchingFollowups(false);
        return;
      }

      if (response.followups_job_id) {
        followupsJobIdRef.current = response.followups_job_id;
        setSuggestedPrompts([]);
        setIsFetchingFollowups(true);
        mixpanel.track('AI Followups Pending', {
          followups_job_id: response.followups_job_id,
          followups_status: response.followups_status ?? 'pending',
        });
        void pollFollowupsJob(response.followups_job_id);
        return;
      }

      if (!preserveExisting) {
        setSuggestedPrompts([]);
      }

      setIsFetchingFollowups(false);
      followupsJobIdRef.current = null;
    },
    [pollFollowupsJob]
  );

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
      followupsJobIdRef.current = null;
      setIsFetchingFollowups(false);
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
    followupsJobIdRef.current = null;
    setIsFetchingFollowups(false);
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

      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, aiMessage]);
      handleFollowupsFromResponse(response);

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
      setIsFetchingFollowups(false);
      followupsJobIdRef.current = null;
    } finally {
      setIsLoading(false);
      setHasFetchedInitialMessage(true);
      initialFetchInProgressRef.current = false;
    }
  }, [configId, messages, sessionId, handleFollowupsFromResponse]);

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
    async (userInput: string, metadata?: ChatMessageMetadata) => {
      if (!userInput.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);
      followupsJobIdRef.current = null;
      setIsFetchingFollowups(false);

      const inputSource = metadata?.inputSource ?? 'user-written';

      // Track AI Prompt Sent event
      mixpanel.track('AI Prompt Sent and Prompt Text', {
        'Prompt Text': userInput,
        input_source: inputSource,
      });

      const hasUserMessage = messages.some(
        (message: ChatMessage) => message.role === 'user'
      );
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
        metadata,
        timestamp: new Date(),
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, userMessage]);

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
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, aiMessage]);
        handleFollowupsFromResponse(response, { preserveExisting: false });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        
        // Track API Error event
        mixpanel.track('API Error', {
          error_type: 'api',
          error_message: errorMessage,
        });
        
        // Remove the user message on error
        setMessages((prevMessages: ChatMessage[]) => prevMessages.slice(0, -1));
        setSuggestedPrompts([]);
        setIsFetchingFollowups(false);
        followupsJobIdRef.current = null;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, configId, isLoading, messages, handleFollowupsFromResponse]
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
    followupsJobIdRef.current = null;
    setIsFetchingFollowups(false);
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
    isFetchingFollowups,
  };
}

