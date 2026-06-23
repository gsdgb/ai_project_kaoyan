import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { conversationApi } from "@/api/endpoints";
import type { Conversation } from "@/types";
import { Card } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { formatDate, truncate } from "@/lib/utils";
import { MessageSquare, Plus, Search } from "lucide-react";
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
      c.user_message.toLowerCase().includes(search.toLowerCase())
  );

  // ---- States ----
  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
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
        <div className="grid gap-3">
          {filtered.map((item) => (
            <Link key={item.id} to={`/chat/${item.id}`} className="no-underline">
              <Card hover className="flex items-start gap-4">
                <div className="hidden sm:flex h-10 w-10 shrink-0 rounded-lg bg-primary-50 items-center justify-center mt-0.5">
                  <MessageSquare size={18} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-neutral-800 truncate">
                      {truncate(item.user_message, 60)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">
                    {truncate(item.assistant_message, 100)}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-xs text-neutral-400">
                    {formatDate(item.created_at)}
                  </span>
                  <Badge size="sm">对话</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
