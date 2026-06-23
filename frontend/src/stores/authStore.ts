import { create } from "zustand";
import type { User } from "@/types";
import { authApi, userApi } from "@/api/endpoints";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    email?: string
  ) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login({ username, password });
      localStorage.setItem("token", data.data.access_token);
      // Fetch profile after login
      const profile = await userApi.getProfile();
      const user = profile.data.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("登录失败，请检查用户名和密码");
    }
  },

  register: async (username, password, email) => {
    set({ isLoading: true });
    try {
      await authApi.register({ username, password, email });
      // Auto-login after register
      await authApi.login({ username, password }).then(({ data }) => {
        localStorage.setItem("token", data.data.access_token);
      });
      const profile = await userApi.getProfile();
      const user = profile.data.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("注册失败，请检查输入信息");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { data } = await userApi.getProfile();
      const user = data.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  hydrate: () => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        set({ user: JSON.parse(user), isAuthenticated: true });
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
}));
