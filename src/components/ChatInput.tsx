import { useState, FormEvent } from 'react';
import type { ChatMessageMetadata } from '../types/api';

interface ChatInputProps {
  onSendMessage: (message: string, metadata?: ChatMessageMetadata) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSendMessage(input, { inputSource: 'user-written' });
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
    >
      <div className="flex gap-2 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || disabled}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="btn-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
              <span className="hidden sm:inline">Sending...</span>
            </div>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </form>
  );
}

