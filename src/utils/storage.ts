import type { ChatMessage } from '../types/api';

interface StoredChat {
  sessionId: string;
  messages: ChatMessage[];
  lastUpdated: number;
  configId: string;
}

const STORAGE_PREFIX = 'storyworld_chat_';

/**
 * Get storage key for a specific character
 */
function getStorageKey(configId: string): string {
  return `${STORAGE_PREFIX}${configId}`;
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

