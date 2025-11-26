import mixpanel from 'mixpanel-browser';
import { getCharacterName } from './storage';

/**
 * Register character_name as a Mixpanel super property
 * Super properties are automatically added to ALL subsequent events
 * Call this when character data is loaded to ensure all events have character_name
 */
export function registerCharacterName(characterName: string): void {
  mixpanel.register({ character_name: characterName });
}

/**
 * Unregister character_name super property
 * Call this when leaving a chat page to prevent character_name from leaking into other page events
 */
export function unregisterCharacterName(): void {
  mixpanel.unregister('character_name');
}

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
 * Always includes character_name property (null if not available) so it appears in Mixpanel
 */
export function withCharacterName(
  properties: Record<string, any> = {},
  configId?: string | null
): Record<string, any> {
  const characterName = getCharacterNameForMixpanel(configId);
  
  // Always include character_name property so it appears in Mixpanel dashboard
  // This allows filtering/grouping even when the name isn't available yet
  const result = {
    ...properties,
    character_name: characterName || null,
  };
  
  // Debug: Log when character_name is not available (only in development)
  if (import.meta.env.DEV && configId && !characterName) {
    console.debug('[Mixpanel] Character name not found for configId:', configId, {
      cache: typeof window !== 'undefined' ? localStorage.getItem('egolab_character_name_cache') : 'N/A',
    });
  }
  
  return result;
}

