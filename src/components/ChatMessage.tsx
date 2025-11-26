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
        className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
          {shouldFormatRoleplayAction && formattedSegments
            ? formattedSegments.map((segment, index) => (
                <span
                  key={`message-segment-${index}`}
                  className={segment.isQuoted ? undefined : 'italic text-primary-200'}
                >
                  {segment.text}
                </span>
              ))
            : message.content}
        </p>
        {message.timestamp && (
          <p
            className={`text-[10px] mt-1.5 ${
              isUser ? 'text-primary-100/80' : 'text-gray-400'
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

