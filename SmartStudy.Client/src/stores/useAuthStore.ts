import { create } from "zustand";
import type { LoginResponseDto } from "@/services/api";

interface AuthState {
  user: LoginResponseDto | null;
  login: (userData: LoginResponseDto) => void;
  logout: () => void;
  isAuthhenticated: boolean;
  token: string | null;
}

const storedUser = localStorage.getItem("user");
const parsedUser: LoginResponseDto | null = storedUser
  ? JSON.parse(storedUser)
  : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: parsedUser,
  token: localStorage.getItem("token") ?? null,
  isAuthhenticated: !!parsedUser,
  login: (userData) => {
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    set({ user: userData, isAuthhenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, isAuthhenticated: false });
  },
}));
