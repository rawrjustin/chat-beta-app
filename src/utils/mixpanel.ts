import { getCharacterName } from './storage';

/**
 * Extract character config_id from URL path
 * Supports patterns like /chat/:configId
 */
export function extractCharacterIdFromUrl(url?: string): string | null {
  if (!url) {
    if (typeof window === 'undefined') return null;
    url = window.location.pathname;
  }

  const match = url.match(/\/chat\/([^/?#]+)/);
  return match ? match[1] : null;
}

/**
 * Get character_name for Mixpanel events
 * Tries to get from cache, returns null if not available
 */
export function getCharacterNameForMixpanel(configId?: string | null): string | null {
  if (!configId) {
    // Try to extract from URL if not provided
    configId = extractCharacterIdFromUrl();
  }

  if (!configId) {
    return null;
  }

  return getCharacterName(configId);
}

/**
 * Helper to add character_name to Mixpanel event properties
 * Returns properties object with character_name if available
 */
export function withCharacterName(
  properties: Record<string, any> = {},
  configId?: string | null
): Record<string, any> {
  const characterName = getCharacterNameForMixpanel(configId);
  if (characterName) {
    return {
      ...properties,
      character_name: characterName,
    };
  }
  return properties;
}

