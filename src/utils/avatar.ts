import type { CharacterResponse } from '../types/api';

const AVATAR_KEY_PATTERN = /(avatar|image)/i;

export function extractAvatarUrl(character: CharacterResponse): string | undefined {
  const directCandidates = [
    character.avatar_url,
    (character as unknown as { avatar?: string }).avatar,
  ];

  for (const candidate of directCandidates) {
    const trimmed = typeof candidate === 'string' ? candidate.trim() : '';
    if (trimmed) {
      return trimmed;
    }
  }

  const visited = new Set<unknown>();
  const queue: unknown[] = character.config ? [character.config] : [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) {
      continue;
    }

    visited.add(current);
    const record = current as Record<string, unknown>;

    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        if (AVATAR_KEY_PATTERN.test(key) && value.trim()) {
          return value.trim();
        }
      } else if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return undefined;
}

