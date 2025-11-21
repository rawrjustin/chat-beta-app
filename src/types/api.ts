// API Response Types
export interface ChatResponse {
  ai: string;
  session_id: string;
  request_id: string; // Required for async preprompts
  text_response_cleaned?: string;
  warning_message?: string | null;
  preprompts: null; // Always null - fetch via /api/preprompts/:request_id
  followups_job_id?: string; // Deprecated - kept for backward compatibility
  followups_ready?: boolean;
  followups_status?: FollowupsJobStatus;
}

export interface CreateSessionResponse {
  session_id: string;
  config_id: string;
  user_id: string;
  session_status: string;
  updated_at: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  password_required?: boolean;
}

// Request Types
export interface CreateSessionRequest {
  config_id: string;
  character_password?: string;
  character_access_token?: string;
}

export interface ProxyChatRequest {
  session_id: string;
  input: string;
  config_id: string;
  conversation_history?: InitialMessageHistoryMessage[];
  character_password?: string;
  character_access_token?: string;
}

export interface InitialMessageHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InitialMessageRequest {
  session_id: string;
  config_id: string;
  previous_messages?: InitialMessageHistoryMessage[];
  character_password?: string;
  character_access_token?: string;
}

// Character Data Types
export interface Character {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  avatar_url?: string; // Support both avatar and avatar_url fields
  password_required?: boolean;
}

// API Character Response Types
export interface CharacterResponse {
  config_id: string;
  name?: string;
  description?: string;
  display_order?: number;
  avatar_url?: string;
  hidden?: boolean;
  password_required?: boolean;
  password_hint?: string | null;
  password_updated_at?: string | null;
  config?: any; // Full character configuration (optional in some endpoints)
}

export interface CharactersResponse {
  characters: CharacterResponse[];
  total: number;
}

export interface AdminCharactersResponse extends CharactersResponse {
  visible: number;
  hidden: number;
}

export interface PasswordProtectionResponse {
  config_id: string;
  password_required: boolean;
  updated_at?: string;
}

export interface CharacterPasswordVerificationResponse {
  success: boolean;
  access_token?: string;
  expires_at?: string | null;
  ttl_seconds?: number | null;
  password_required?: boolean;
}

// Chat Message Types
export interface ChatMessageMetadata {
  promptType?: SuggestedPrepromptType;
  isRoleplayAction?: boolean;
  inputSource?: 'user-written' | 'prompt-roleplay' | 'prompt-conversation';
  simplifiedText?: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp?: Date;
  metadata?: ChatMessageMetadata;
  request_id?: string; // For fetching async preprompts (only on AI messages)
}

export type SuggestedPrepromptType = 'roleplay' | 'conversation';

export interface SuggestedPreprompt {
  type: SuggestedPrepromptType;
  prompt: string;
  simplified_text: string;
}

export type FollowupsJobStatus = 'pending' | 'ready' | 'failed';

export interface FollowupsJobResponse {
  followups_job_id: string;
  status: FollowupsJobStatus;
  preprompts?: SuggestedPreprompt[];
  error?: string;
  poll_after_ms?: number;
  completed_at?: string;
}

// Async Preprompts Response (new endpoint: GET /api/preprompts/:request_id)
export interface PrepromptResponse {
  request_id: string;
  preprompts: SuggestedPreprompt[] | null;
  retry_after?: number; // Milliseconds to wait before retrying (when status is 202)
  message?: string; // Status message
}

