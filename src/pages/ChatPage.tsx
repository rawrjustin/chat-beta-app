import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useChat } from '../hooks/useChat';
import { usePreprompts } from '../hooks/usePreprompts';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TypingIndicator } from '../components/TypingIndicator';
import { getCharacterConfig, getCharacters, verifyCharacterPassword } from '../utils/api';
import { extractAvatarUrl, normalizeAvatarUrl } from '../utils/avatar';
import { SuggestedPromptsBar } from '../components/SuggestedPromptsBar';
import {
  clearCharacterAccessToken,
  getCharacterAccessToken,
  saveCharacterAccessToken,
  setCharacterName,
  setCharacterNames,
} from '../utils/storage';
import type {
  CharacterResponse,
  SuggestedPreprompt,
  ChatMessageMetadata,
  ChatMessage as ChatMessageType,
} from '../types/api';

export function ChatPage() {
  const { configId } = useParams<{ configId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [character, setCharacter] = useState<CharacterResponse | null>(null);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const normalizedConfigId = configId ?? '';
  const isPasswordProtected = Boolean(character?.password_required);
  
  // Check for stored token to determine if chat should be unlocked
  // This prevents race conditions where state hasn't updated yet
  const storedTokenForUnlock = normalizedConfigId ? getCharacterAccessToken(normalizedConfigId) : null;
  const hasTokenForUnlock = Boolean(accessToken) || Boolean(storedTokenForUnlock);
  const needsPasswordForUnlock = isPasswordProtected || Boolean(storedTokenForUnlock);
  
  const isChatUnlocked = Boolean(
    normalizedConfigId &&
    !isLoadingCharacter &&
    (!needsPasswordForUnlock || hasTokenForUnlock)
  );
  const handleTokenInvalidated = useCallback(() => {
    if (normalizedConfigId) {
      clearCharacterAccessToken(normalizedConfigId);
    }
    setAccessToken(null);
    setPasswordInput('');
    setPasswordError(null);
    setPasswordSuccess(null);
  }, [normalizedConfigId]);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
  } = useChat(normalizedConfigId, {
    accessToken,
    enabled: isChatUnlocked,
    onTokenInvalidated: handleTokenInvalidated,
  });

  // Get the latest AI message's request_id for fetching preprompts
  const latestAiMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'ai') {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  // Check if we have inline preprompts (old backend) or need to fetch async (new backend)
  const hasInlinePreprompts = latestAiMessage?.inline_preprompts && latestAiMessage.inline_preprompts.length > 0;
  const latestRequestId = !hasInlinePreprompts ? latestAiMessage?.request_id : null;

  // Fetch preprompts async only if we don't have inline preprompts
  const {
    preprompts: asyncPreprompts,
    isLoading: isFetchingFollowups,
  } = usePreprompts(latestRequestId);

  // Use inline preprompts if available, otherwise use async preprompts
  const suggestedPrompts = hasInlinePreprompts ? latestAiMessage.inline_preprompts : asyncPreprompts;

  const [promptVisibility, setPromptVisibility] = useState<'hidden' | 'visible' | 'fading'>(
    'hidden'
  );

  const promptFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeVersionRef = useRef(0);
  const promptsContainerRef = useRef<HTMLDivElement>(null);
  const justSetTokenRef = useRef(false);
  
  // Check if we have a token in state OR in localStorage
  // This prevents showing password prompt if token exists but state hasn't updated yet
  const storedToken = normalizedConfigId ? getCharacterAccessToken(normalizedConfigId) : null;
  const hasToken = Boolean(accessToken) || Boolean(storedToken);
  
  // Character needs password if:
  // 1. API explicitly says password_required: true, OR
  // 2. We have a stored token (proving it was password-protected when we authenticated)
  const needsPassword = isPasswordProtected || Boolean(storedToken);
  
  // Character is locked if it needs a password AND we don't have a valid token AND not loading
  const isLocked = needsPassword && !hasToken && !isLoadingCharacter;
  const canForgetAccess = needsPassword && hasToken;

  const avatarUrl = character?.avatar_url?.trim() ?? '';
  const hasAvatar = avatarUrl !== '';
  const imageUrl = hasAvatar ? normalizeAvatarUrl(avatarUrl) : '';

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  useEffect(() => {
    if (!normalizedConfigId || isLoadingCharacter) {
      return;
    }

    // Don't run if we just set a token from password submission
    // This prevents race conditions where this effect clears the token we just set
    if (justSetTokenRef.current) {
      return;
    }

    if (!character) {
      clearCharacterAccessToken(normalizedConfigId);
      setAccessToken(null);
      return;
    }

    // Check if we have a stored token first
    // If we have a token, it means the character was password-protected when we authenticated
    // Don't clear it just because the API response doesn't include password_required
    const stored = getCharacterAccessToken(normalizedConfigId);
    
    if (stored) {
      // Check if token is expired
      if (stored.expiresAt && stored.expiresAt <= Date.now()) {
        clearCharacterAccessToken(normalizedConfigId);
        setAccessToken(null);
        return;
      }
      
      // If we have a valid stored token, use it (even if character.password_required is missing from API)
      // Only load from storage if we don't already have one in state
      if (!accessToken) {
        setAccessToken(stored.token);
      }
      return;
    }

    // No stored token - check if character requires password
    if (!character.password_required) {
      // Character doesn't require password and we have no token - clear any stale state
      setAccessToken(null);
      return;
    }

    // Character requires password but we have no stored token
    setAccessToken(null);
  }, [character, normalizedConfigId, isLoadingCharacter, accessToken]);

  // Fetch character info
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!configId) {
        setIsLoadingCharacter(false);
        setCharacter(null);
        return;
      }

      setIsLoadingCharacter(true);
      setImageError(false);
      setImageLoaded(false);
      try {
        let resolvedCharacter: CharacterResponse | null = null;

        try {
          resolvedCharacter = await getCharacterConfig(configId);
        } catch (primaryError) {
          console.warn('Direct character lookup failed, falling back to characters list', {
            configId,
            error: primaryError instanceof Error ? primaryError.message : primaryError,
          });
          const data = await getCharacters();
          resolvedCharacter =
            data.characters.find((char) => char.config_id === configId) ?? null;
          
          // When falling back to characters list, populate cache for ALL characters
          // This ensures the cache is available for future events
          const nameMappings = data.characters
            .filter((char) => char.config_id && char.name)
            .map((char) => ({
              configId: char.config_id,
              name: char.name!,
            }));
          if (nameMappings.length > 0) {
            setCharacterNames(nameMappings);
          }
        }

        if (resolvedCharacter) {
          const extracted = extractAvatarUrl(resolvedCharacter) ?? resolvedCharacter.avatar_url;
          const enhancedCharacter = {
            ...resolvedCharacter,
            avatar_url: normalizeAvatarUrl(extracted),
          };
          setCharacter(enhancedCharacter);
          
          // Populate character name cache for Mixpanel tracking
          // Do this even if we already populated from getCharacters() to ensure it's up to date
          if (resolvedCharacter.config_id && resolvedCharacter.name) {
            setCharacterName(resolvedCharacter.config_id, resolvedCharacter.name);
          }
        } else {
          setCharacter(null);
        }
      } catch (err) {
        console.error('Failed to fetch character:', err);
        setCharacter(null);
      } finally {
        setIsLoadingCharacter(false);
      }
    };

    fetchCharacter();
  }, [configId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset prompt visibility whenever new prompts are provided
  useEffect(() => {
    const hasPrompts = suggestedPrompts && suggestedPrompts.length > 0;
    // Only show loading state if we're actually fetching AND have a request ID
    // This prevents white space when we're not actively fetching
    const shouldShowLoading = isFetchingFollowups && latestRequestId;

    if (hasPrompts || shouldShowLoading) {
      setPromptVisibility((prevVisibility: typeof promptVisibility) =>
        prevVisibility === 'visible' ? prevVisibility : 'visible'
      );
      if (promptFadeTimeoutRef.current) {
        clearTimeout(promptFadeTimeoutRef.current);
        promptFadeTimeoutRef.current = null;
      }
    } else {
      setPromptVisibility((prevVisibility: typeof promptVisibility) =>
        prevVisibility === 'visible' || prevVisibility === 'fading'
          ? 'hidden'
          : prevVisibility
      );
    }
  }, [suggestedPrompts, isFetchingFollowups, latestRequestId, promptVisibility]);

  useEffect(() => {
    return () => {
      if (promptFadeTimeoutRef.current) {
        clearTimeout(promptFadeTimeoutRef.current);
      }
    };
  }, []);

  // Scroll to show preprompts when they appear
  useEffect(() => {
    if (promptVisibility === 'visible' && suggestedPrompts && suggestedPrompts.length > 0) {
      // Small delay to let the DOM update
      setTimeout(() => {
        promptsContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 100);
    }
  }, [promptVisibility, suggestedPrompts]);

  const schedulePromptFadeOut = useCallback(() => {
    const hasPrompts = suggestedPrompts && suggestedPrompts.length > 0;
    if (!hasPrompts) {
      return;
    }

    fadeVersionRef.current += 1;
    const currentVersion = fadeVersionRef.current;

    setPromptVisibility('fading');

    if (promptFadeTimeoutRef.current) {
      clearTimeout(promptFadeTimeoutRef.current);
    }

    promptFadeTimeoutRef.current = setTimeout(() => {
      if (fadeVersionRef.current === currentVersion) {
        // Preprompts will hide automatically when user sends next message
        // (latestRequestId changes, causing preprompts to reset)
        setPromptVisibility('hidden');
        promptFadeTimeoutRef.current = null;
      }
    }, 220);
  }, [suggestedPrompts]);

  const handlePasswordSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!normalizedConfigId) {
        return;
      }

      const trimmedPassword = passwordInput.trim();
      if (!trimmedPassword) {
        setPasswordError('Please enter the password.');
        return;
      }

      setPasswordError(null);
      setPasswordSuccess(null);
      setIsVerifyingPassword(true);

      try {
        const response = await verifyCharacterPassword(normalizedConfigId, trimmedPassword);

        if (!response.success || !response.access_token) {
          throw new Error('Incorrect password. Please try again.');
        }

        let expiresAtMs: number | undefined;
        if (response.expires_at) {
          const parsed = Date.parse(response.expires_at);
          if (!Number.isNaN(parsed)) {
            expiresAtMs = parsed;
          }
        } else if (typeof response.ttl_seconds === 'number') {
          expiresAtMs = Date.now() + response.ttl_seconds * 1000;
        }

        saveCharacterAccessToken(
          normalizedConfigId,
          response.access_token,
          typeof expiresAtMs === 'number' ? expiresAtMs : null
        );

        // Set flag to prevent token loading effect from interfering
        justSetTokenRef.current = true;
        setAccessToken(response.access_token);
        setPasswordInput('');
        setPasswordSuccess('Access granted. Loading chat…');

        // Clear the flag after a short delay to allow state to settle
        setTimeout(() => {
          justSetTokenRef.current = false;
        }, 100);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to verify password. Please try again.';
        setPasswordError(message);
      } finally {
        setIsVerifyingPassword(false);
      }
    },
    [normalizedConfigId, passwordInput]
  );

  const handleForgetAccess = useCallback(() => {
    if (!normalizedConfigId) {
      return;
    }
    clearCharacterAccessToken(normalizedConfigId);
    setAccessToken(null);
    setPasswordInput('');
    setPasswordError(null);
    setPasswordSuccess(null);
    startNewConversation();
  }, [normalizedConfigId, startNewConversation]);

  const handleSendMessage = useCallback(
    (message: string, metadata?: ChatMessageMetadata) => {
      if (!message.trim() || isLoading || isLocked) {
        return;
      }

      schedulePromptFadeOut();
      void sendMessage(message, metadata);
    },
    [isLoading, isLocked, schedulePromptFadeOut, sendMessage]
  );

  const handlePromptSelect = (prompt: SuggestedPreprompt) => {
    if (!prompt?.prompt) {
      return;
    }

    if (prompt.type === 'roleplay') {
      const metadata: ChatMessageMetadata = {
        promptType: prompt.type,
        isRoleplayAction: true,
        inputSource: 'prompt-roleplay',
      simplifiedText: prompt.simplified_text,
      };
      handleSendMessage(prompt.prompt, metadata);
      return;
    }

    if (prompt.type === 'conversation') {
      handleSendMessage(prompt.prompt, {
        promptType: prompt.type,
        inputSource: 'prompt-conversation',
      simplifiedText: prompt.simplified_text,
      });
      return;
    }

    handleSendMessage(prompt.prompt, {
      promptType: prompt.type,
    simplifiedText: prompt.simplified_text,
    });
  };

  if (!configId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Character Not Found</h1>
          <Link to="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLocked) {
    const characterName = character?.name || configId || 'AI Character';
    const characterDescription = character?.description || 'Chat with AI';
    const pageTitle = `Chat with ${characterName}`;
    const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://egolab.app/chat/${configId}`;
    const ogImage = imageUrl || 'https://egolab.app/bg.png';

    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={characterDescription} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={characterDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={pageUrl} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:site_name" content="Ego Lab" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={characterDescription} />
          <meta name="twitter:image" content={ogImage} />
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <div className="w-full max-w-xl space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            {isLoadingCharacter ? (
              <div className="flex flex-col items-center justify-center gap-4 py-6 text-gray-600">
                <LoadingSpinner />
                <p>Loading character details…</p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  {hasAvatar && !imageError ? (
                    <img
                      src={imageUrl}
                      alt={character?.name || 'Character avatar'}
                      className="w-16 h-16 rounded-full object-contain border border-gray-200 bg-white p-1"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600">
                      {character?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {character?.name || normalizedConfigId || 'AI Character'}
                      </h1>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg
                          className="w-3.5 h-3.5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a2 2 0 002 2h8a2 2 0 002-2v-7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" />
                        </svg>
                        Password Required
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {character?.description || 'Enter the password below to unlock this chat.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                placeholder="Enter password to unlock"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
              />
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isVerifyingPassword || passwordInput.trim().length === 0}
            >
              {isVerifyingPassword ? 'Validating…' : 'Unlock Character'}
            </button>
          </form>
        </div>
      </div>
      </>
    );
  }

  const characterName = character?.name || configId || 'AI Character';
  const characterDescription = character?.description || 'Chat with AI';
  const pageTitle = `Chat with ${characterName}`;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://egolab.app/chat/${configId}`;
  const ogImage = imageUrl || 'https://egolab.app/bg.png';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={characterDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={characterDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Ego Lab" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={characterDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      <div
        className="min-h-screen bg-gray-50 flex"
        style={{ minHeight: '100dvh' }}
      >
      {/* Character Sidebar - Hidden on mobile, visible on larger screens */}
      <aside className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 bg-white border-r border-gray-200 sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200">
          <Link
            to="/"
            className="text-gray-600 hover:text-purple-600 transition-colors inline-flex items-center gap-2 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isLoadingCharacter
              ? 'Loading...'
              : character?.name || configId || 'AI Character'}
          </h2>
          {isPasswordProtected && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a2 2 0 002 2h8a2 2 0 002-2v-7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" />
              </svg>
              Password Protected
            </span>
          )}
          <p className="text-sm text-gray-600 line-clamp-3">
            {isLoadingCharacter
              ? ''
              : character?.description || 'Chat with AI'}
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="w-full max-w-xs h-[400px] bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-lg">
            {hasAvatar && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={character?.name || 'Character'}
                  className={`w-full h-full object-contain p-4 transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </>
            ) : (
              <div className="text-8xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {character?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 space-y-3">
          <button
            onClick={startNewConversation}
            className="w-full btn-secondary text-sm px-4 py-2.5"
            disabled={isLoading}
          >
            New Chat
          </button>
          {canForgetAccess && (
            <button
              onClick={handleForgetAccess}
              className="w-full border border-gray-300 text-sm px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Forget Password
            </button>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header - Mobile only */}
        <header
          className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-primary-600 transition-colors flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                    {isLoadingCharacter
                      ? 'Loading...'
                      : character?.name || configId || 'AI Character'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">
                    {isLoadingCharacter
                      ? ''
                      : character?.description || 'Chat with AI'}
                  </p>
                  {isPasswordProtected && (
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full mt-1">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a2 2 0 002 2h8a2 2 0 002-2v-7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" />
                      </svg>
                      Password Protected
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startNewConversation}
                  className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex-shrink-0"
                  disabled={isLoading}
                >
                  New Chat
                </button>
                {canForgetAccess && (
                  <button
                    onClick={handleForgetAccess}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Forget Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Messages - Extra bottom padding to account for sticky input area */}
        <div
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-32 pt-20 sm:pt-24 lg:pt-6 relative z-10"
        >
          {/* Mobile Background Avatar - Only visible on mobile */}
          {hasAvatar && !imageError && imageUrl && (
            <div 
              className="lg:hidden absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.12,
              }}
            />
          )}
          
          {/* Overlay gradient to ensure readability */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-gray-50/70 via-gray-50/50 to-gray-50/70 pointer-events-none z-0" />
          
          <div className="max-w-4xl mx-auto relative z-10">
          {isLoading && messages.length === 0 && (
            <div className="flex justify-start mb-4">
              <div className="bg-white/90 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-600">Send a message to begin chatting</p>
            </div>
          )}

          {messages.map((message: ChatMessageType, index: number) => (
            <ChatMessage key={index} message={message} />
          ))}

          {isLoading && messages.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

        {/* Chat Input - Sticky at bottom with z-index to stay above scrolling content */}
        <div ref={promptsContainerRef} className="border-t border-gray-200 bg-white sticky bottom-0 z-30">
          <SuggestedPromptsBar
            prompts={suggestedPrompts || []}
            visibility={promptVisibility}
            onSelect={handlePromptSelect}
            disabled={isLoading || isLocked}
            isLoading={isFetchingFollowups}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={isLocked}
          />
        </div>
      </div>
    </div>
    </>
  );
}

