import { create } from 'zustand';
import { User, Post } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

interface AppState {
  posts: Post[];
  selectedAuthor: 'all' | 'dad' | 'eldest' | 'youngest';
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  setSelectedAuthor: (author: 'all' | 'dad' | 'eldest' | 'youngest') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useAppStore = create<AppState>((set) => ({
  posts: [],
  selectedAuthor: 'all',
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  setSelectedAuthor: (selectedAuthor) => set({ selectedAuthor }),
}));