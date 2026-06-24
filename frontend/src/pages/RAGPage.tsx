import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ragApi } from "@/api/endpoints";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Bot, Search, BookOpen, User, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import client from "@/api/client";

interface RAGMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { content: string; metadata: Record<string, unknown> }[];
}

export default function RAGPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<RAGMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searching, setSearching] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Load RAG history on mount
  useEffect(() => {
    ragApi
      .history()
      .then(({ data }) => {
        const history: RAGMessage[] = [];
        for (const item of data.data) {
          history.push({ role: "user", content: item.user_message });
          history.push({ role: "assistant", content: item.assistant_message });
        }
        setMessages(history);
      })
      .catch(() => {
        // silently fail — user can still use the page
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || searching) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuery("");
    setSearching(true);

    try {
      const { data } = await client.post(
        "/rag/chat",
        null,
        { params: { query: q } }
      );
      const result = data.data as { answer: string; sources?: RAGMessage["sources"] };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
        },
      ]);
    } catch {
      toast.error("RAG 检索失败");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，检索过程出现错误，请稍后重试。" },
      ]);
    } finally {
      setSearching(false);
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("已复制");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-800">RAG 知识检索</h1>
        <p className="text-sm text-neutral-400 mt-1">
          基于已上传文档的智能问答
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {loadingHistory && (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="知识库检索"
            description="输入问题，AI 将基于您上传的文档内容进行回答"
          />
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-success-100 flex items-center justify-center mt-0.5">
                <Bot size={16} className="text-success-600" />
              </div>
            )}

            <div
              className={`relative group max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-br-md"
                  : "bg-white border border-neutral-200 rounded-bl-md shadow-xs"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose-chat">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <p className="text-xs font-medium text-neutral-500 mb-2">
                    参考来源
                  </p>
                  <div className="space-y-1.5">
                    {msg.sources.map((src, j) => (
                      <div
                        key={j}
                        className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2"
                      >
                        {src.content?.slice(0, 200) || ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy */}
              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => handleCopy(msg.content, i)}
                  className="absolute top-2 right-2 h-6 w-6 inline-flex items-center justify-center rounded-md bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100 cursor-pointer"
                >
                  {copiedIdx === i ? (
                    <Check size={12} className="text-success-500" />
                  ) : (
                    <Copy size={12} className="text-neutral-400" />
                  )}
                </button>
              )}
            </div>

            {msg.role === "user" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-200 flex items-center justify-center mt-0.5">
                <User size={16} className="text-neutral-500" />
              </div>
            )}
          </div>
        ))}

        {searching && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200/60 pt-4 pb-2">
        <div className="flex items-end gap-2 bg-white rounded-2xl border border-neutral-300 shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="基于知识库搜索..."
            disabled={searching}
            className="flex-1 resize-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none py-1.5 max-h-40"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || searching}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-success-600 text-white hover:bg-success-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Search size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
