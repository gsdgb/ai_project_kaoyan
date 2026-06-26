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
  useRag: boolean,
  onToken: (text: string) => void,
  onSources: (sources: Record<string, unknown>[]) => void,
  onDone: () => void,
  onError: (err: string) => void
): AbortController {
  const controller = new AbortController();
  const token = localStorage.getItem("token");

  fetch("/api/v1/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message: question, use_rag: useRag }),
    signal: controller.signal,
  })
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
        // 按 \n\n 帧解析，不按单行粗暴解析
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";
        for (const frame of frames) {
          if (!frame.trim()) continue;
          for (const line of frame.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const event = JSON.parse(raw);
              if (event.type === "token") {
                onToken(event.content ?? "");
              } else if (event.type === "sources") {
                onSources(event.sources ?? []);
              } else if (event.type === "done") {
                onDone();
                return;
              } else if (event.type === "error") {
                onError(event.content ?? "stream error");
                return;
              }
              // saved, tool_start, node_end, hitl etc. → ignore
            } catch {
              // ignore non-JSON data
            }
          }
        }
      }
      // flush trailing buffer
      if (buffer.trim()) {
        for (const line of buffer.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === "token") onToken(event.content ?? "");
            else if (event.type === "done") { onDone(); return; }
          } catch { /* ignore */ }
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
