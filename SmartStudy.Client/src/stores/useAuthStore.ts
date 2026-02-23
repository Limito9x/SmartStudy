import { create } from "zustand";
import type { UserResponseDto, LoginResponseDto } from "@/services/api";

interface AuthState {
  user: UserResponseDto | null;
  login: (userData: LoginResponseDto) => void;
  logout: () => void;
  isAuthhenticated: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthhenticated: false,
  login: (userData) => {
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    set({ user: userData, isAuthhenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthhenticated: false });
  },
}));
