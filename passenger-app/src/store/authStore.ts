import { create } from 'zustand';
import { Passenger } from '../../../../shared/types';

interface AuthState {
  user: Passenger | null;
  isLoading: boolean;
  setUser: (user: Passenger) => void;
  clearUser: () => void;
  setLanguage: (lang: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLanguage: (lang) => set((state) => ({
    user: state.user ? { ...state.user, language: lang as any } : null,
  })),
}));
