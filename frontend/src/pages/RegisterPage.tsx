import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button, Input } from "@/components/ui";
import toast from "react-hot-toast";
import { UserPlus, User, Lock, Mail } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = "请输入用户名";
    else if (username.length < 3) errs.username = "用户名至少 3 个字符";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "邮箱格式不正确";
    if (!password) errs.password = "请输入密码";
    else if (password.length < 6) errs.password = "密码至少 6 位";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(username, password, email || undefined);
      toast.success("注册成功");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "注册失败");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/60 p-8">
      <h2 className="text-lg font-semibold text-neutral-800 mb-6 text-center">
        注册账号
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="username"
          label="用户名"
          placeholder="请输入用户名"
          icon={<User size={16} />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          autoFocus
        />
        <Input
          id="email"
          type="email"
          label="邮箱（选填）"
          placeholder="请输入邮箱"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          id="password"
          type="password"
          label="密码"
          placeholder="请输入密码（至少 6 位）"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          {!isLoading && <UserPlus size={18} />}
          注册
        </Button>
      </form>

      <p className="text-sm text-neutral-400 text-center mt-6">
        已有账号？
        <Link
          to="/login"
          className="text-primary-600 hover:text-primary-700 font-medium ml-1"
        >
          立即登录
        </Link>
      </p>
    </div>
  );
}
