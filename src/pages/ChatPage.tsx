import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getCharacters } from '../utils/api';
import type { CharacterResponse } from '../types/api';

export function ChatPage() {
  const { configId } = useParams<{ configId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [character, setCharacter] = useState<CharacterResponse | null>(null);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { messages, isLoading, error, sendMessage, startNewConversation } = useChat(
    configId || ''
  );

  // Normalize image URL - handle relative URLs
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // If it's already a full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative URL starting with /, prepend API base URL
    if (url.startsWith('/')) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return `${API_BASE}${url}`;
    }
    
    // Otherwise return as is (might be a data URL or other format)
    return url;
  };

  const hasAvatar = character?.avatar_url && character.avatar_url.trim() !== '';
  const imageUrl = hasAvatar ? getImageUrl(character.avatar_url) : '';

  const handleImageError = () => {
    console.error('Failed to load avatar image:', {
      url: character?.avatar_url,
      normalizedUrl: imageUrl,
      character: character?.name,
    });
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Fetch character info
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!configId) {
        setIsLoadingCharacter(false);
        return;
      }

      setIsLoadingCharacter(true);
      setImageError(false);
      setImageLoaded(false);
      try {
        const data = await getCharacters();
        const foundCharacter = data.characters.find(
          (char) => char.config_id === configId
        );
        setCharacter(foundCharacter || null);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          <p className="text-sm text-gray-600 line-clamp-3">
            {isLoadingCharacter
              ? ''
              : character?.description || 'Chat with AI'}
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="w-full max-w-xs aspect-[5/6] bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-lg">
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
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
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

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={startNewConversation}
            className="w-full btn-secondary text-sm px-4 py-2.5"
            disabled={isLoading}
          >
            New Chat
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Mobile only */}
        <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-airbnb-dark transition-colors flex-shrink-0"
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
                  <h1 className="text-base sm:text-lg md:text-xl font-semibold text-airbnb-dark truncate">
                    {isLoadingCharacter
                      ? 'Loading...'
                      : character?.name || configId || 'AI Character'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">
                    {isLoadingCharacter
                      ? ''
                      : character?.description || 'Chat with AI'}
                  </p>
                </div>
              </div>
              <button
                onClick={startNewConversation}
                className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex-shrink-0"
                disabled={isLoading}
              >
                New Chat
              </button>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6"
        >
          <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
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

          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {isLoading && messages.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <LoadingSpinner />
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

        {/* Chat Input */}
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

