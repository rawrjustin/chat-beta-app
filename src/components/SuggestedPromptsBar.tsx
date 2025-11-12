import { useMemo } from 'react';
import type { SuggestedPreprompt } from '../types/api';

type PromptVisibility = 'hidden' | 'visible' | 'fading';

interface SuggestedPromptsBarProps {
  prompts: SuggestedPreprompt[];
  visibility?: PromptVisibility;
  disabled?: boolean;
  onSelect: (prompt: SuggestedPreprompt) => void;
}

export function SuggestedPromptsBar({
  prompts,
  visibility = 'hidden',
  disabled = false,
  onSelect,
}: SuggestedPromptsBarProps) {
  const shouldRender = prompts.length > 0 || visibility === 'fading';

  const containerClasses = useMemo(() => {
    if (!shouldRender) {
      return 'hidden';
    }

    const baseClasses =
      'transition-all duration-300 ease-out transform px-3 sm:px-4 md:px-6 lg:px-8 pt-2.5 sm:pt-3 pb-2.5 sm:pb-3';

    if (visibility === 'visible') {
      return `${baseClasses} opacity-100 translate-y-0 pointer-events-auto`;
    }

    if (visibility === 'fading') {
      return `${baseClasses} opacity-0 translate-y-2 pointer-events-none`;
    }

    return `${baseClasses} opacity-0 -translate-y-2 pointer-events-none`;
  }, [shouldRender, visibility]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={containerClasses} aria-hidden={visibility === 'hidden'}>
      <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 max-w-4xl mx-auto">
        {prompts.map((prompt, index) => {
          const key = `${prompt.type}-${index}-${prompt.simplified_text || prompt.prompt}`;
          const accentColor =
            prompt.type === 'roleplay'
              ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 border-purple-200 hover:border-purple-300'
              : 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 border-blue-200 hover:border-blue-300';

          const displayText = (prompt.simplified_text ?? '').trim() || prompt.prompt;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(prompt)}
              disabled={disabled}
              className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left text-sm sm:text-base font-medium text-gray-800 border rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${accentColor}`}
              aria-label={prompt.prompt}
              title={prompt.prompt}
              data-prompt-type={prompt.type}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                    prompt.type === 'roleplay' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="leading-snug">{displayText}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

