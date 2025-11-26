import type { ChatMessage } from '../types/api';

interface StoredChat {
  sessionId: string;
  messages: ChatMessage[];
  lastUpdated: number;
  configId: string;
}

const STORAGE_PREFIX = 'egolab_chat_';
const ACCESS_STORAGE_PREFIX = 'egolab_character_access_';
const CHARACTER_NAME_CACHE_KEY = 'egolab_character_name_cache';

interface StoredCharacterAccess {
  configId: string;
  token: string;
  storedAt: number;
  expiresAt?: number | null;
}

/**
 * Get storage key for a specific character
 */
function getStorageKey(configId: string): string {
  return `${STORAGE_PREFIX}${configId}`;
}

function getAccessStorageKey(configId: string): string {
  return `${ACCESS_STORAGE_PREFIX}${configId}`;
}

/**
 * Save chat session to local storage
 */
export function saveChatSession(
  configId: string,
  sessionId: string,
  messages: ChatMessage[]
): void {
  try {
    const chatData: StoredChat = {
      sessionId,
      messages: messages.map((msg) => ({
        ...msg,
        // Convert Date objects to ISO strings for storage
        timestamp: msg.timestamp 
          ? (msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp)
          : new Date().toISOString(),
      })) as any, // Type assertion needed because we're storing as string
      lastUpdated: Date.now(),
      configId,
    };
    localStorage.setItem(getStorageKey(configId), JSON.stringify(chatData));
  } catch (error) {
    console.error('Failed to save chat session to local storage:', error);
  }
}

/**
 * Load chat session from local storage
 */
export function loadChatSession(configId: string): StoredChat | null {
  try {
    const stored = localStorage.getItem(getStorageKey(configId));
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    
    // Convert timestamp strings back to Date objects
    const chatData: StoredChat = {
      ...parsed,
      messages: parsed.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp 
          ? (typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : new Date(msg.timestamp))
          : new Date(),
      })),
    };

    return chatData;
  } catch (error) {
    console.error('Failed to load chat session from local storage:', error);
    return null;
  }
}

/**
 * Clear chat session from local storage
 */
export function clearChatSession(configId: string): void {
  try {
    localStorage.removeItem(getStorageKey(configId));
  } catch (error) {
    console.error('Failed to clear chat session from local storage:', error);
  }
}

/**
 * Get all stored chat sessions (for debugging or management)
 */
export function getAllChatSessions(): Record<string, StoredChat> {
  const sessions: Record<string, StoredChat> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const configId = key.replace(STORAGE_PREFIX, '');
        const session = loadChatSession(configId);
        if (session) {
          sessions[configId] = session;
        }
      }
    }
  } catch (error) {
    console.error('Failed to get all chat sessions:', error);
  }
  
  return sessions;
}

export function saveCharacterAccessToken(
  configId: string,
  token: string,
  expiresAt?: number | null
): void {
  try {
    const payload: StoredCharacterAccess = {
      configId,
      token,
      storedAt: Date.now(),
      expiresAt: typeof expiresAt === 'number' ? expiresAt : null,
    };
    localStorage.setItem(getAccessStorageKey(configId), JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save character access token:', error);
  }
}

export function getCharacterAccessToken(configId: string): StoredCharacterAccess | null {
  try {
    const raw = localStorage.getItem(getAccessStorageKey(configId));
    if (!raw) {
      return null;
    }
    const parsed: StoredCharacterAccess = JSON.parse(raw);
    return parsed;
  } catch (error) {
    console.error('Failed to load character access token:', error);
    return null;
  }
}

export function clearCharacterAccessToken(configId: string): void {
  try {
    localStorage.removeItem(getAccessStorageKey(configId));
  } catch (error) {
    console.error('Failed to clear character access token:', error);
  }
}

/**
 * Character Name Cache
 * Maps character config_id to character name for Mixpanel tracking
 */

interface CharacterNameCache {
  [configId: string]: string;
}

/**
 * Get the character name cache from localStorage
 */
function getCharacterNameCache(): CharacterNameCache {
  try {
    const cached = localStorage.getItem(CHARACTER_NAME_CACHE_KEY);
    if (!cached) return {};
    return JSON.parse(cached);
  } catch (error) {
    console.error('Failed to load character name cache:', error);
    return {};
  }
}

/**
 * Save the character name cache to localStorage
 */
function saveCharacterNameCache(cache: CharacterNameCache): void {
  try {
    localStorage.setItem(CHARACTER_NAME_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save character name cache:', error);
  }
}

/**
 * Get character name for a given config_id
 */
export function getCharacterName(configId: string): string | null {
  const cache = getCharacterNameCache();
  return cache[configId] || null;
}

/**
 * Set character name for a given config_id
 */
export function setCharacterName(configId: string, name: string): void {
  if (!configId || !name) return;
  const cache = getCharacterNameCache();
  cache[configId] = name;
  saveCharacterNameCache(cache);
}

/**
 * Set multiple character names at once (for bulk updates)
 */
export function setCharacterNames(mappings: Array<{ configId: string; name: string }>): void {
  const cache = getCharacterNameCache();
  for (const { configId, name } of mappings) {
    if (configId && name) {
      cache[configId] = name;
    }
  }
  saveCharacterNameCache(cache);
}

/**
 * Clear character name from cache
 */
export function clearCharacterName(configId: string): void {
  const cache = getCharacterNameCache();
  delete cache[configId];
  saveCharacterNameCache(cache);
}

/**
 * Clear all character names from cache
 */
export function clearAllCharacterNames(): void {
  try {
    localStorage.removeItem(CHARACTER_NAME_CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear character name cache:', error);
  }
}

