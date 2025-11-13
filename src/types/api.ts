// API Response Types
export interface ChatResponse {
  ai: string;
  session_id: string;
  request_id?: string;
  text_response_cleaned?: string;
  warning_message?: string | null;
  preprompts?: SuggestedPreprompt[];
  followups_job_id?: string;
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
}

// Request Types
export interface CreateSessionRequest {
  config_id: string;
}

export interface ProxyChatRequest {
  session_id: string;
  input: string;
  config_id: string;
  conversation_history?: InitialMessageHistoryMessage[];
}

export interface InitialMessageHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InitialMessageRequest {
  session_id: string;
  config_id: string;
  previous_messages?: InitialMessageHistoryMessage[];
}

// Character Data Types
export interface Character {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  avatar_url?: string; // Support both avatar and avatar_url fields
}

// API Character Response Types
export interface CharacterResponse {
  config_id: string;
  name?: string;
  description?: string;
  display_order?: number;
  avatar_url?: string;
  hidden?: boolean;
  config: any; // Full character configuration
}

export interface CharactersResponse {
  characters: CharacterResponse[];
  total: number;
}

export interface AdminCharactersResponse extends CharactersResponse {
  visible: number;
  hidden: number;
}

// Chat Message Types
export interface ChatMessageMetadata {
  promptType?: SuggestedPrepromptType;
  isRoleplayAction?: boolean;
  inputSource?: 'user-written' | 'prompt-roleplay' | 'prompt-conversation';
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp?: Date;
  metadata?: ChatMessageMetadata;
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

