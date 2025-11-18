import type {
  ChatResponse,
  CreateSessionResponse,
  ErrorResponse,
  CreateSessionRequest,
  ProxyChatRequest,
  InitialMessageRequest,
  InitialMessageHistoryMessage,
  CharactersResponse,
  AdminCharactersResponse,
  FollowupsJobResponse,
  PasswordProtectionResponse,
  CharacterPasswordVerificationResponse,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CharacterAuthOptions {
  characterPassword?: string;
  characterAccessToken?: string;
}

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

export async function createSession(
  configId: string,
  auth?: CharacterAuthOptions
): Promise<CreateSessionResponse> {
  const request: CreateSessionRequest = {
    config_id: configId,
    ...(auth?.characterPassword ? { character_password: auth.characterPassword } : {}),
    ...(auth?.characterAccessToken
      ? { character_access_token: auth.characterAccessToken }
      : {}),
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
  input: string,
  conversationHistory?: InitialMessageHistoryMessage[],
  auth?: CharacterAuthOptions
): Promise<ChatResponse> {
  const request: ProxyChatRequest = {
    session_id: sessionId,
    config_id: configId,
    input: input,
    ...(conversationHistory && conversationHistory.length > 0
      ? { conversation_history: conversationHistory }
      : {}),
    ...(auth?.characterPassword ? { character_password: auth.characterPassword } : {}),
    ...(auth?.characterAccessToken
      ? { character_access_token: auth.characterAccessToken }
      : {}),
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
  previousMessages?: InitialMessageHistoryMessage[],
  auth?: CharacterAuthOptions
): Promise<ChatResponse> {
  const request: InitialMessageRequest = {
    session_id: sessionId,
    config_id: configId,
    ...(previousMessages && previousMessages.length > 0
      ? { previous_messages: previousMessages }
      : {}),
    ...(auth?.characterPassword ? { character_password: auth.characterPassword } : {}),
    ...(auth?.characterAccessToken
      ? { character_access_token: auth.characterAccessToken }
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

export async function getAdminCharacters(password: string): Promise<AdminCharactersResponse> {
  const response = await fetch(
    `${API_BASE}/admin/api/characters?password=${encodeURIComponent(password)}`
  );

  const contentType = response.headers.get('content-type');
  if (!response.ok || !contentType || !contentType.includes('application/json')) {
    throw new Error('Authentication failed - incorrect password or unexpected response');
  }

  return response.json();
}

export async function fetchFollowupsJob(jobId: string): Promise<FollowupsJobResponse> {
  const response = await fetch(
    `${API_BASE}/api/chat-followups/${encodeURIComponent(jobId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return handleResponse<FollowupsJobResponse>(response);
}

export async function verifyCharacterPassword(
  configId: string,
  password: string
): Promise<CharacterPasswordVerificationResponse> {
  const response = await fetch(
    `${API_BASE}/api/characters/${encodeURIComponent(configId)}/verify-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    }
  );

  return handleResponse<CharacterPasswordVerificationResponse>(response);
}

export async function setCharacterPasswordProtection(
  configId: string,
  adminPassword: string,
  newPassword: string
): Promise<PasswordProtectionResponse> {
  const response = await fetch(
    `${API_BASE}/admin/api/characters/${encodeURIComponent(
      configId
    )}/password?password=${encodeURIComponent(adminPassword)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    }
  );

  return handleResponse<PasswordProtectionResponse>(response);
}

export async function clearCharacterPasswordProtection(
  configId: string,
  adminPassword: string
): Promise<PasswordProtectionResponse> {
  const response = await fetch(
    `${API_BASE}/admin/api/characters/${encodeURIComponent(
      configId
    )}/password?password=${encodeURIComponent(adminPassword)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return handleResponse<PasswordProtectionResponse>(response);
}

