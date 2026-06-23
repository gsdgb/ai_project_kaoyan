import { useAuthStore } from "@/stores/authStore";
import { Card, CardHeader, CardTitle, Button } from "@/components/ui";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("已退出登录");
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">个人设置</h1>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">
                {user?.username}
              </h2>
              <p className="text-sm text-neutral-400">用户 ID: {user?.id}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
            <InfoRow
              icon={Mail}
              label="邮箱"
              value={user?.email || "未设置"}
            />
            <InfoRow
              icon={Calendar}
              label="注册时间"
              value={user?.created_at ? formatDate(user.created_at) : "-"}
            />
            <InfoRow
              icon={Shield}
              label="账户状态"
              value={user?.is_active ? "正常" : "已禁用"}
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>账户操作</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full justify-start" disabled>
            <User size={16} />
            修改密码（即将推出）
          </Button>
          <Button
            variant="danger"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            退出登录
          </Button>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="text-neutral-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm text-neutral-700">{value}</p>
      </div>
    </div>
  );
}
