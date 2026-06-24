import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { conversationApi } from "@/api/endpoints";
import type { Conversation } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatDate, truncate } from "@/lib/utils";
import { MessageSquare, Plus, Search, Clock } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ConversationListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await conversationApi.list();
      setConversations(data.data);
    } catch {
      setError("无法加载对话列表");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = conversations.filter(
    (c) =>
      !search ||
      c.user_message.toLowerCase().includes(search.toLowerCase()) ||
      c.assistant_message.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">对话记录</h1>
          <p className="text-sm text-neutral-400 mt-1">
            共 {conversations.length} 条对话
          </p>
        </div>
        <Link to="/chat">
          <Button>
            <Plus size={16} />
            新对话
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索对话内容..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={search ? "未找到匹配的对话" : "还没有对话记录"}
          description={
            search ? "请尝试更换搜索关键词" : "开始一段新的对话，探索 AI 的能力"
          }
          action={
            <Link to="/chat">
              <Button variant="primary" size="sm">
                <Plus size={14} />
                开始对话
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <Link
              key={item.id}
              to={`/chat/${item.id}`}
              className="block group no-underline"
            >
              <div className="bg-white rounded-xl border border-neutral-200/80 px-5 py-4 hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer">
                {/* Question line */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-6 w-6 shrink-0 rounded-md bg-primary-50 flex items-center justify-center">
                    <MessageSquare size={13} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 leading-relaxed line-clamp-2">
                      {item.user_message}
                    </p>
                    {/* Answer preview */}
                    <p className="mt-1.5 text-sm text-neutral-400 leading-relaxed line-clamp-2">
                      {truncate(item.assistant_message, 120)}
                    </p>
                    {/* Time */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-300">
                      <Clock size={11} />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
