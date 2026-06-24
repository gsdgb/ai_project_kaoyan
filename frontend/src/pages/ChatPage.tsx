import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatApi, conversationApi } from "@/api/endpoints";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  Send,
  Square,
  Zap,
  User,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- Load history detail when id changes ---
  useEffect(() => {
    if (!id) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);
    conversationApi
      .detail(Number(id))
      .then(({ data }) => {
        if (cancelled) return;
        const item = data.data;
        setMessages([
          { role: "user", content: item.user_message },
          { role: "assistant", content: item.assistant_message },
        ]);
      })
      .catch(() => {
        if (!cancelled) toast.error("加载历史记录失败");
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || streaming) return;

    // Cancel any pending abort
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setStreaming(true);

    // Placeholder for assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const { data } = await chatApi.send({ message: q }, controller.signal);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          last.content = data.data.assistant_message;
        }
        return next;
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // user cancelled — do nothing
      } else {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant" && !last.content) {
            const msg =
              err instanceof Error ? err.message : "请求失败，请稍后重试";
            last.content = `[错误] ${msg}`;
          }
          return next;
        });
        toast.error("请求失败");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("已复制");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // ---- Loading history ----
  if (loadingHistory) {
    return (
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse-dot" />
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse-dot"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse-dot"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    );
  }

  // ---- Empty state ----
  if (messages.length === 0) {
    return (
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Zap}
            title="开始对话"
            description="向 AI 学习助手提问，探索知识的无限可能"
          />
        </div>
        <ChatInputBar
          input={input}
          setInput={setInput}
          streaming={streaming}
          onSend={handleSend}
          onCancel={handleCancel}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {/* Avatar */}
            {msg.role === "assistant" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-primary-100 flex items-center justify-center mt-0.5">
                <Bot size={16} className="text-primary-600" />
              </div>
            )}

            {/* Bubble */}
            <div
              className={cn(
                "relative group max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-br-md"
                  : "bg-white border border-neutral-200 rounded-bl-md shadow-xs"
              )}
            >
              {msg.role === "assistant" ? (
                msg.content ? (
                  <div className="prose-chat">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-neutral-400">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse-dot" />
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse-dot"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse-dot"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </span>
                )
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Copy button */}
              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => handleCopy(msg.content, i)}
                  className="absolute top-2 right-2 h-6 w-6 inline-flex items-center justify-center rounded-md bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100 cursor-pointer"
                  title="复制"
                >
                  {copiedIdx === i ? (
                    <Check size={12} className="text-success-500" />
                  ) : (
                    <Copy size={12} className="text-neutral-400" />
                  )}
                </button>
              )}
            </div>

            {/* User avatar */}
            {msg.role === "user" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-200 flex items-center justify-center mt-0.5">
                <User size={16} className="text-neutral-500" />
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInputBar
        input={input}
        setInput={setInput}
        streaming={streaming}
        onSend={handleSend}
        onCancel={handleCancel}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
      />
    </div>
  );
}

// ---- Chat Input Bar ----
function ChatInputBar({
  input,
  setInput,
  streaming,
  onSend,
  onCancel,
  onKeyDown,
  inputRef,
}: {
  input: string;
  setInput: (v: string) => void;
  streaming: boolean;
  onSend: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="border-t border-neutral-200/60 pt-4 pb-2 bg-neutral-50">
      <div className="flex items-end gap-2 bg-white rounded-2xl border border-neutral-300 shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="输入您的问题..."
          disabled={streaming}
          className="flex-1 resize-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none py-1.5 max-h-40"
        />
        {streaming ? (
          <button
            onClick={onCancel}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-danger-100 text-danger-500 hover:bg-danger-200 transition-colors cursor-pointer shrink-0"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Send size={15} />
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-400 text-center mt-2">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}
