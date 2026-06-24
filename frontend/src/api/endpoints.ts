import client from "./client";
import type {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  Token,
  User,
  ChatRequest,
  ChatMessage,
  Conversation,
  UserFile,
} from "@/types";

// ---- Auth ----
export const authApi = {
  register: (data: RegisterPayload) =>
    client.post<ApiResponse<User>>("/auth/register", data),
  login: (data: LoginPayload) =>
    client.post<ApiResponse<Token>>("/auth/login", data),
};

// ---- User ----
export const userApi = {
  getProfile: () => client.get<ApiResponse<User>>("/users/me"),
};

// ---- Chat ----
export const chatApi = {
  send: (data: ChatRequest, signal?: AbortSignal) =>
    client.post<ApiResponse<ChatMessage>>("/chat", data, { signal }),
};

// ---- Conversations ----
export const conversationApi = {
  list: () => client.get<ApiResponse<Conversation[]>>("/conversations"),
  detail: (id: number) =>
    client.get<ApiResponse<Conversation>>(`/conversations/${id}`),
};

// ---- Files ----
export const fileApi = {
  list: () => client.get<ApiResponse<UserFile[]>>("/files"),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<ApiResponse<UserFile>>("/files/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id: number) => client.delete(`/files/${id}`),
};

// ---- RAG ----
export const ragApi = {
  history: () => client.get<ApiResponse<Conversation[]>>("/rag/history"),
};

// ---- SSE Stream ----
export function streamChat(
  question: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): AbortController {
  const controller = new AbortController();
  const token = localStorage.getItem("token");

  fetch(
    `/api/v1/stream?question=${encodeURIComponent(question)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }
  )
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream body");
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === "token") {
              onChunk(event.content ?? "");
            } else if (event.type === "status" && event.content === "finished") {
              onDone();
              return;
            } else if (event.type === "error") {
              onError(event.content ?? "stream error");
              return;
            }
            // ignore other event types (tool_start, node_end, hitl)
          } catch {
            // not JSON — treat as raw text chunk
            onChunk(raw);
          }
        }
      }
      // flush trailing buffer
      if (buffer.startsWith("data: ")) {
        const raw = buffer.slice(6).trim();
        if (raw) {
          try {
            const event = JSON.parse(raw);
            if (event.type === "token") onChunk(event.content ?? "");
          } catch {
            onChunk(raw);
          }
        }
      }
      onDone();
    })
    .catch((err) => {
      if (err.name !== "AbortError") onError(err.message);
    });

  return controller;
}

// ---- WebSocket ----
export function wsChat(
  token: string,
  onMessage: (msg: { type: string; content: string }) => void,
  onError: (err: string) => void,
  onClose: () => void
): { ws: WebSocket; send: (action: string, question?: string) => void } {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(
    `${protocol}//${window.location.host}/api/v1/ws/chat?token=${token}`
  );

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      onMessage(msg);
    } catch {
      onMessage({ type: "text", content: e.data });
    }
  };
  ws.onerror = () => onError("WebSocket 连接失败");
  ws.onclose = onClose;

  const send = (action: string, question?: string) => {
    ws.send(JSON.stringify({ action, question }));
  };

  return { ws, send };
}
