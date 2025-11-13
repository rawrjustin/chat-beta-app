export interface QuoteSegment {
  text: string;
  isQuoted: boolean;
}

/**
 * Splits a string into segments that are inside or outside of double quotes.
 * Consecutive characters wrapped in double quotes (") are marked as quoted segments.
 * Everything else is considered unquoted.
 */
export function segmentByQuotes(content: string): QuoteSegment[] {
  if (!content) {
    return [];
  }

  const segments: QuoteSegment[] = [];
  let buffer = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (char === '"') {
      buffer += char;

      if (inQuotes) {
        // Closing quote: flush the quoted segment including the trailing quote.
        segments.push({ text: buffer, isQuoted: true });
        buffer = '';
        inQuotes = false;
      } else {
        // Opening quote: flush any accumulated outside-quote text before the quote.
        const prefix = buffer.slice(0, -1);
        if (prefix) {
          segments.push({ text: prefix, isQuoted: false });
        }
        buffer = '"';
        inQuotes = true;
      }
    } else {
      buffer += char;
    }
  }

  if (buffer) {
    segments.push({ text: buffer, isQuoted: inQuotes });
  }

  return segments.filter((segment) => segment.text.length > 0);
}

