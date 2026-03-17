import { create } from 'zustand';
import { Doctor } from '../types';
import { api } from '../lib/api';

interface AuthState {
  doctor: Doctor | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  doctor: null,
  token: localStorage.getItem('mv_token'),
  loading: true,

  init: async () => {
    const token = localStorage.getItem('mv_token');
    if (!token) { set({ loading: false }); return; }
    try {
      const { doctor } = await api.me();
      set({ doctor, token, loading: false });
    } catch {
      localStorage.removeItem('mv_token');
      set({ doctor: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { doctor, token } = await api.login(email, password);
    localStorage.setItem('mv_token', token);
    set({ doctor, token });
  },

  logout: () => {
    localStorage.removeItem('mv_token');
    set({ doctor: null, token: null });
  },
}));
