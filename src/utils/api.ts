import type {
  ChatResponse,
  CreateSessionResponse,
  ErrorResponse,
  CreateSessionRequest,
  ProxyChatRequest,
  InitialMessageRequest,
  InitialMessageHistoryMessage,
  CharactersResponse,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}`,
      message: response.statusText,
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function createSession(configId: string): Promise<CreateSessionResponse> {
  const request: CreateSessionRequest = {
    config_id: configId,
  };

  const response = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<CreateSessionResponse>(response);
}

export async function sendChatMessage(
  sessionId: string,
  configId: string,
  input: string
): Promise<ChatResponse> {
  const request: ProxyChatRequest = {
    session_id: sessionId,
    config_id: configId,
    input: input,
  };

  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<ChatResponse>(response);
}

export async function fetchInitialMessage(
  sessionId: string,
  configId: string,
  previousMessages?: InitialMessageHistoryMessage[]
): Promise<ChatResponse> {
  const request: InitialMessageRequest = {
    session_id: sessionId,
    config_id: configId,
    ...(previousMessages && previousMessages.length > 0
      ? { previous_messages: previousMessages }
      : {}),
  };

  const response = await fetch(`${API_BASE}/api/initial-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<ChatResponse>(response);
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE}/health`);
  return handleResponse<{ status: string; timestamp: string }>(response);
}

export async function getCharacters(): Promise<CharactersResponse> {
  const response = await fetch(`${API_BASE}/api/characters`);
  return handleResponse<CharactersResponse>(response);
}

export async function getCharacterConfig(configId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/config/${configId}`);
  return handleResponse<any>(response);
}

