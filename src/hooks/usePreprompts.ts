import { useState, useEffect, useRef } from 'react';
import type { SuggestedPreprompt } from '../types/api';
import { fetchPreprompts } from '../utils/api';
import mixpanel from 'mixpanel-browser';
import { withCharacterName } from '../utils/mixpanel';

const MAX_RETRIES = 5;
const PREPROMPT_TIMEOUT = 15000; // 15 seconds total timeout

export function usePreprompts(requestId: string | null | undefined) {
  const [preprompts, setPreprompts] = useState<SuggestedPreprompt[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Reset state when requestId changes
    if (!requestId) {
      setPreprompts(null);
      setIsLoading(false);
      setError(null);
      retryCountRef.current = 0;
      return;
    }

    // Start fresh for new request
    setPreprompts(null);
    setIsLoading(true);
    setError(null);
    retryCountRef.current = 0;
    startTimeRef.current = Date.now();

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Set overall timeout
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      setError('Suggestions timed out');
      mixpanel.track('Async Preprompts Timeout', withCharacterName({
        request_id: requestId,
        retry_count: retryCountRef.current,
      }));
    }, PREPROMPT_TIMEOUT);

    async function fetchPrepromptsWithRetry() {
      if (!isMountedRef.current || !requestId) return;

      const elapsedTime = Date.now() - startTimeRef.current;

      // Check if we've exceeded max retries or timeout
      if (retryCountRef.current >= MAX_RETRIES || elapsedTime >= PREPROMPT_TIMEOUT) {
        if (!isMountedRef.current) return;
        setIsLoading(false);
        setError('Suggestions unavailable');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        mixpanel.track('Async Preprompts Max Retries', withCharacterName({
          request_id: requestId,
          retry_count: retryCountRef.current,
          elapsed_time_ms: elapsedTime,
        }));
        return;
      }

      try {
        const response = await fetchPreprompts(requestId);

        if (!isMountedRef.current) return;

        // Success - we have preprompts
        if (response.preprompts && response.preprompts.length > 0) {
          setPreprompts(response.preprompts);
          setIsLoading(false);
          setError(null);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          mixpanel.track('Async Preprompts Success', withCharacterName({
            request_id: requestId,
            retry_count: retryCountRef.current,
            elapsed_time_ms: Date.now() - startTimeRef.current,
            preprompt_count: response.preprompts.length,
          }));
          return;
        }

        // Still generating (202) or null preprompts - retry
        retryCountRef.current += 1;
        const retryDelay = response.retry_after || 1000;

        if (!isMountedRef.current) return;

        retryTimeoutRef.current = setTimeout(() => {
          void fetchPrepromptsWithRetry();
        }, retryDelay);
      } catch (err) {
        if (!isMountedRef.current) return;

        const errorMessage = err instanceof Error ? err.message : 'Failed to load suggestions';
        setError(errorMessage);
        setIsLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        mixpanel.track('Async Preprompts Error', withCharacterName({
          request_id: requestId,
          retry_count: retryCountRef.current,
          error_message: errorMessage,
        }));
      }
    }

    void fetchPrepromptsWithRetry();

    // Cleanup on unmount or requestId change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [requestId]);

  return { preprompts, isLoading, error };
}
