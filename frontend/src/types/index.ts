// ---- API Response ----
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// ---- User ----
export interface User {
  id: number;
  username: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
}

export interface Token {
  access_token: string;
}

// ---- Chat ----
export interface ChatMessage {
  id: number;
  user_message: string;
  assistant_message: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
}

// ---- Conversation ----
export interface Conversation {
  id: number;
  title?: string;
  user_message: string;
  assistant_message: string;
  created_at: string;
}

// ---- File ----
export interface UserFile {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

// ---- RAG ----
export interface RAGResult {
  answer: string;
  sources?: { content: string; metadata: Record<string, unknown> }[];
}

// ---- WebSocket Message ----
export interface WSMessage {
  type: "text" | "status" | "error" | "tool_call" | "tool_result" | "final";
  content: string;
  metadata?: Record<string, unknown>;
}

// ---- View State ----
export type ViewState = "idle" | "loading" | "empty" | "error" | "success";
