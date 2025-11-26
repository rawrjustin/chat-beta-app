import { useMemo } from 'react';
import type { SuggestedPreprompt } from '../types/api';
import { segmentByQuotes } from '../utils/text';

type PromptVisibility = 'hidden' | 'visible' | 'fading';

interface SuggestedPromptsBarProps {
  prompts: SuggestedPreprompt[];
  visibility?: PromptVisibility;
  disabled?: boolean;
  isLoading?: boolean;
  onSelect: (prompt: SuggestedPreprompt) => void;
}

export function SuggestedPromptsBar({
  prompts,
  visibility = 'hidden',
  disabled = false,
  isLoading = false,
  onSelect,
}: SuggestedPromptsBarProps) {
  const shouldRender = prompts.length > 0 || visibility === 'fading' || isLoading;

  const containerClasses = useMemo(() => {
    if (!shouldRender) {
      return 'hidden';
    }

    const baseClasses =
      'transition-all duration-300 ease-out transform px-3 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-2.5 pb-2 sm:pb-2.5';

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

  const showLoadingOnly = isLoading && prompts.length === 0;

  return (
    <div className={containerClasses} aria-hidden={visibility === 'hidden'}>
      <div
        className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 max-w-4xl mx-auto"
        aria-live={isLoading ? 'polite' : 'off'}
      >
        {showLoadingOnly ? (
          <div className="w-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-gradient-to-r from-slate-100 via-white to-slate-100 border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
            <span
              className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-slate-300 border-t-transparent animate-spin"
              aria-hidden="true"
            />
            <span className="leading-snug">Generating follow-up suggestions...</span>
          </div>
        ) : (
          prompts.map((prompt, index) => {
          const key = `${prompt.type}-${index}-${prompt.simplified_text || prompt.prompt}`;
          const accentColor =
            prompt.type === 'roleplay'
              ? 'bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 border-primary-200 hover:border-primary-300'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-200';

          const displayText = (prompt.simplified_text ?? '').trim() || prompt.prompt;
          const isRoleplay = prompt.type === 'roleplay';
          const segments = isRoleplay ? segmentByQuotes(displayText) : null;

            return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(prompt)}
              disabled={disabled}
              className={`w-full px-4 sm:px-5 py-2 sm:py-2.5 text-left text-sm sm:text-base font-medium text-gray-800 border rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${accentColor}`}
              aria-label={prompt.prompt}
              title={prompt.prompt}
              data-prompt-type={prompt.type}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                    prompt.type === 'roleplay' ? 'bg-primary-500' : 'bg-blue-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="leading-snug">
                  {isRoleplay && segments
                    ? segments.map((segment, segmentIndex) => (
                        <span
                          key={`${key}-segment-${segmentIndex}`}
                          className={segment.isQuoted ? undefined : 'italic'}
                        >
                          {segment.text}
                        </span>
                      ))
                    : displayText}
                </span>
              </span>
            </button>
            );
          })
        )}
      </div>
    </div>
  );
}

