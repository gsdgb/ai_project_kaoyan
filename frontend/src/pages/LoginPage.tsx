import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button, Input } from "@/components/ui";
import toast from "react-hot-toast";
import { LogIn, User, Lock } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = "请输入用户名";
    if (!password) errs.password = "请输入密码";
    else if (password.length < 6) errs.password = "密码至少 6 位";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(username, password);
      toast.success("登录成功");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "登录失败");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/60 p-8">
      <h2 className="text-lg font-semibold text-neutral-800 mb-6 text-center">
        登录账号
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
          id="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          {!isLoading && <LogIn size={18} />}
          登录
        </Button>
      </form>

      <p className="text-sm text-neutral-400 text-center mt-6">
        还没有账号？
        <Link
          to="/register"
          className="text-primary-600 hover:text-primary-700 font-medium ml-1"
        >
          立即注册
        </Link>
      </p>
    </div>
  );
}
