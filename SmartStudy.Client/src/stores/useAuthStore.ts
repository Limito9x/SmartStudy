// src/stores/useAuthStore.ts
import { create } from "zustand";
import type { UserResponseDto, LoginResponseDto } from "@/services/api";

interface AuthState {
  user: UserResponseDto | null;
  login: (userData: LoginResponseDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (userData) => {
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    set({ user: userData });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
}));
