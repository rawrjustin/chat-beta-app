import type { ChatMessage as ChatMessageType } from '../types/api';
import { segmentByQuotes } from '../utils/text';

interface ChatMessageProps {
  message: ChatMessageType;
  key?: string | number;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const shouldFormatRoleplayAction =
    Boolean(message.metadata?.isRoleplayAction) && isUser;
  const formattedSegments = shouldFormatRoleplayAction
    ? segmentByQuotes(message.content)
    : null;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
          isUser
            ? 'bg-airbnb-red text-white rounded-tr-none'
            : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none shadow-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
          {shouldFormatRoleplayAction && formattedSegments
            ? formattedSegments.map((segment, index) => (
                <span
                  key={`message-segment-${index}`}
                  className={segment.isQuoted ? undefined : 'italic'}
                >
                  {segment.text}
                </span>
              ))
            : message.content}
        </p>
        {message.timestamp && (
          <p
            className={`text-xs mt-1 ${
              isUser ? 'text-red-100' : 'text-gray-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

