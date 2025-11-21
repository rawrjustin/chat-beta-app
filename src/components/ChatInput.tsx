import { useState, FormEvent, useRef, useEffect, KeyboardEvent } from 'react';
import type { ChatMessageMetadata } from '../types/api';

interface ChatInputProps {
  onSendMessage: (message: string, metadata?: ChatMessageMetadata) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submitMessage = () => {
    if (!input.trim() || isLoading || disabled) return;

    onSendMessage(input, { inputSource: 'user-written' });
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    // Refocus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift, submit the form
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
    // Shift+Enter will allow default behavior (new line)
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Refocus input when loading completes (after message is sent)
  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isLoading]);

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
    >
      <div className="flex gap-2 max-w-4xl mx-auto items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          disabled={isLoading || disabled}
          rows={1}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none overflow-hidden min-h-[2.5rem] max-h-48"
          style={{ height: 'auto' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="btn-primary px-4 sm:px-6 py-2 sm:py-3 text-base"
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

