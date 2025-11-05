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
  const { messages, isLoading, error, sendMessage, startNewConversation } = useChat(
    configId || ''
  );

  // Fetch character info
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!configId) {
        setIsLoadingCharacter(false);
        return;
      }

      setIsLoadingCharacter(true);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-airbnb-dark transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              <div>
                <h1 className="text-xl font-semibold text-airbnb-dark">
                  {isLoadingCharacter
                    ? 'Loading...'
                    : character?.name || configId || 'AI Character'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isLoadingCharacter
                    ? ''
                    : character?.description || 'Chat with AI'}
                </p>
              </div>
            </div>
            <button
              onClick={startNewConversation}
              className="btn-secondary text-sm"
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
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6"
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
  );
}

