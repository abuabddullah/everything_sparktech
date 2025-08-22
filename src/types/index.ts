export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  include_tts?: boolean;
  voice_settings?: {
    language: string;
    voice: string;
    speed: number;
  };
}

export interface ChatResponse {
  response: string;
  audio_url?: string;
  conversation_id?: string;
  timestamp: Date;
}

export interface WikiSearchRequest {
  query: string;
  limit?: number;
  detailed?: boolean;
}

export interface WikiSearchResponse {
  results: WikiResult[];
  query: string;
  total_results: number;
}

export interface WikiResult {
  title: string;
  summary: string;
  url: string;
  page_id?: string;
}

export interface TTSRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
}

export interface TTSResponse {
  audio_url: string;
  text: string;
  settings: {
    language: string;
    voice: string;
    speed: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: Date;
  status: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  googleApiKey: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}