export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      <span
        className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
        style={{ animationDelay: '0ms', animationDuration: '600ms' }}
      />
      <span
        className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
        style={{ animationDelay: '150ms', animationDuration: '600ms' }}
      />
      <span
        className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
        style={{ animationDelay: '300ms', animationDuration: '600ms' }}
      />
    </div>
  );
}
