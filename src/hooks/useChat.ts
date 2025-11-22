import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type {
  ChatMessage,
  InitialMessageHistoryMessage,
  ChatMessageMetadata,
} from '../types/api';
import {
  createSession,
  fetchInitialMessage,
  sendChatMessage,
  ApiError,
} from '../utils/api';
import mixpanel from 'mixpanel-browser';
import { saveChatSession, loadChatSession, clearChatSession, clearCharacterAccessToken } from '../utils/storage';

const mapChatMessageToHistory = ({
  role,
  content,
}: ChatMessage): InitialMessageHistoryMessage => ({
  role: role === 'ai' ? 'assistant' : 'user',
  content,
});

interface UseChatOptions {
  accessToken?: string | null;
  characterPassword?: string;
  enabled?: boolean;
  onTokenInvalidated?: () => void;
}

export function useChat(configId: string, options: UseChatOptions = {}) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedInitialMessage, setHasFetchedInitialMessage] = useState(false);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const initialFetchInProgressRef = useRef(false);
  const isComponentMountedRef = useRef(true);
  const isEnabled = options.enabled !== false;

  const authOptions = useMemo(
    () => ({
      characterPassword: options.characterPassword,
      characterAccessToken: options.accessToken ?? undefined,
    }),
    [options.accessToken, options.characterPassword]
  );

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  // Load saved chat session on mount or when changing characters
  useEffect(() => {
    if (!configId || !isEnabled) {
      setSessionId('');
      setMessages([]);
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

    setError(null);
    setIsLoading(false);
    setHasAttemptedRestore(true);
    initialFetchInProgressRef.current = false;
  }, [
    configId,
    authOptions.characterAccessToken,
    authOptions.characterPassword,
    isEnabled,
  ]);

  // Save chat session whenever messages or sessionId changes
  useEffect(() => {
    if (!configId || !isEnabled) return;

    // Only save if we have messages or a session ID
    if (messages.length > 0 || sessionId) {
      saveChatSession(configId, sessionId, messages);
    }
  }, [configId, sessionId, messages, isEnabled]);

  // Sync backend session ID with Mixpanel user identity
  useEffect(() => {
    if (!sessionId || !isEnabled) {
      return;
    }

    mixpanel.identify(sessionId);
    mixpanel.register({ session_id: sessionId });
  }, [sessionId, isEnabled]);

  const initializeChat = useCallback(async () => {
    if (!configId || !isEnabled) {
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
        const session = await createSession(configId, authOptions);
        activeSessionId = session.session_id;
        setSessionId(activeSessionId);
      }

      const previousMessagesPayload = messages.slice(-5).map(mapChatMessageToHistory);

      const startTime = Date.now();
      const response = await fetchInitialMessage(
        activeSessionId,
        configId,
        previousMessagesPayload.length > 0 ? previousMessagesPayload : undefined,
        authOptions
      );
      const responseTime = Date.now() - startTime;

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      const inlinePreprompts = response.preprompts && Array.isArray(response.preprompts) ? response.preprompts : undefined;

      console.log('[useChat:initializeChat] Received response:', {
        request_id: response.request_id,
        has_preprompts: !!response.preprompts,
        preprompts_type: typeof response.preprompts,
        preprompts_is_array: Array.isArray(response.preprompts),
        preprompts_count: response.preprompts?.length || 0,
        inline_preprompts_count: inlinePreprompts?.length || 0,
        response_preprompts: response.preprompts
      });

      const aiMessage: ChatMessage = {
        role: 'ai',
        content: response.ai,
        timestamp: new Date(),
        request_id: response.request_id,
        inline_preprompts: inlinePreprompts,
      };

      console.log('[useChat:initializeChat] Created AI message:', {
        request_id: aiMessage.request_id,
        inline_preprompts_count: aiMessage.inline_preprompts?.length || 0,
      });

      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, aiMessage]);

      mixpanel.track('AI Initial Message', {
        'API Response Time': responseTime,
      });
    } catch (err) {
      if (err instanceof ApiError && err.passwordRequired && configId) {
        clearCharacterAccessToken(configId);
        if (options.onTokenInvalidated) {
          options.onTokenInvalidated();
        }
        setError('Your session has expired. Please enter the password again.');
      } else {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load initial message';
        setError(errorMessage);
        mixpanel.track('API Error', {
          error_type: 'initial_message',
          error_message: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
      setHasFetchedInitialMessage(true);
      initialFetchInProgressRef.current = false;
    }
  }, [configId, messages, sessionId, authOptions, isEnabled, options.onTokenInvalidated]);

  useEffect(() => {
    if (!configId || !hasAttemptedRestore || !isEnabled) {
      return;
    }

    if (hasFetchedInitialMessage) {
      return;
    }

    void initializeChat();
  }, [configId, hasAttemptedRestore, hasFetchedInitialMessage, initializeChat, isEnabled]);

  const sendMessage = useCallback(
    async (userInput: string, metadata?: ChatMessageMetadata) => {
      if (!userInput.trim() || isLoading || !configId || !isEnabled) return;

      setIsLoading(true);
      setError(null);

      const inputSource = metadata?.inputSource ?? 'user-written';

      // Track AI Prompt Sent event
      const promptEventPayload: Record<string, string> = {
        'Prompt Text': userInput,
        input_source: inputSource,
      };

      if (metadata?.simplifiedText) {
        promptEventPayload.simplified_text = metadata.simplifiedText;
      }

      mixpanel.track('AI Prompt Sent and Prompt Text', promptEventPayload);

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
          const session = await createSession(configId, authOptions);
          activeSessionId = session.session_id;
          setSessionId(activeSessionId);
        }

        const response = await sendChatMessage(
          activeSessionId,
          configId,
          userInput,
          conversationHistory,
          authOptions
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
        const inlinePreprompts = response.preprompts && Array.isArray(response.preprompts) ? response.preprompts : undefined;

        console.log('[useChat:sendMessage] Received response:', {
          request_id: response.request_id,
          has_preprompts: !!response.preprompts,
          preprompts_type: typeof response.preprompts,
          preprompts_is_array: Array.isArray(response.preprompts),
          preprompts_count: response.preprompts?.length || 0,
          inline_preprompts_count: inlinePreprompts?.length || 0,
          response_preprompts: response.preprompts
        });

        const aiMessage: ChatMessage = {
          role: 'ai',
          content: response.ai,
          timestamp: new Date(),
          request_id: response.request_id,
          inline_preprompts: inlinePreprompts,
        };

        console.log('[useChat:sendMessage] Created AI message:', {
          request_id: aiMessage.request_id,
          inline_preprompts_count: aiMessage.inline_preprompts?.length || 0,
        });

        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, aiMessage]);
      } catch (err) {
        if (err instanceof ApiError && err.passwordRequired && configId) {
          clearCharacterAccessToken(configId);
          if (options.onTokenInvalidated) {
            options.onTokenInvalidated();
          }
          setError('Your session has expired. Please enter the password again.');
          // Remove the user message on error
          setMessages((prevMessages: ChatMessage[]) => prevMessages.slice(0, -1));
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
          setError(errorMessage);

          // Track API Error event
          mixpanel.track('API Error', {
            error_type: 'api',
            error_message: errorMessage,
          });

          // Remove the user message on error
          setMessages((prevMessages: ChatMessage[]) => prevMessages.slice(0, -1));
        }
      } finally {
        setIsLoading(false);
      }
  },
    [
      sessionId,
      configId,
      isLoading,
      messages,
      authOptions,
      isEnabled,
      options.onTokenInvalidated,
    ]
  );

  const startNewConversation = useCallback(() => {
    setSessionId('');
    setMessages([]);
    setError(null);
    setHasFetchedInitialMessage(false);
    setHasAttemptedRestore(true);
    setIsLoading(false);
    initialFetchInProgressRef.current = false;
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

