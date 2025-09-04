import { create } from 'zustand';
import { User, Post, Event, Goal, HelpRequest } from '@/types';
import { 
  getUsers, 
  getPosts, 
  getEvents, 
  getGoals, 
  getHelpRequests,
  initializeDatabase 
} from '@/lib/firebase/index';

interface AuthState {
  user: User | null;
  users: User[];
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  loadUsers: () => Promise<void>;
  initializeApp: () => Promise<void>;
}

interface AppState {
  posts: Post[];
  events: Event[];
  goals: Goal[];
  helpRequests: HelpRequest[];
  selectedAuthor: 'all' | 'dad' | 'eldest' | 'youngest';
  isDataLoading: boolean;
  setPosts: (posts: Post[]) => void;
  setEvents: (events: Event[]) => void;
  setGoals: (goals: Goal[]) => void;
  setHelpRequests: (helpRequests: HelpRequest[]) => void;
  addPost: (post: Post) => void;
  addEvent: (event: Event) => void;
  addGoal: (goal: Goal) => void;
  addHelpRequest: (helpRequest: HelpRequest) => void;
  setSelectedAuthor: (author: 'all' | 'dad' | 'eldest' | 'youngest') => void;
  setDataLoading: (loading: boolean) => void;
  loadAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: [],
  isLoading: true,
  isInitialized: false,
  
  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),
  setLoading: (isLoading) => set({ isLoading }),
  
  loadUsers: async () => {
    try {
      const users = await getUsers();
      set({ users });
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  },
  
  initializeApp: async () => {
    try {
      const state = get();
      if (state.isInitialized) {
        return;
      }
      
      set({ isLoading: true });
      
      // 데이터베이스 초기화 (한 번만)
      await initializeDatabase();
      
      // 사용자 목록 로드
      await get().loadUsers();
      
      set({ isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ isLoading: false });
    }
  }
}));

export const useAppStore = create<AppState>((set, get) => ({
  posts: [],
  events: [],
  goals: [],
  helpRequests: [],
  selectedAuthor: 'all',
  isDataLoading: false,
  
  setPosts: (posts) => set({ posts }),
  setEvents: (events) => set({ events }),
  setGoals: (goals) => set({ goals }),
  setHelpRequests: (helpRequests) => set({ helpRequests }),
  
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  addHelpRequest: (helpRequest) => set((state) => ({ helpRequests: [helpRequest, ...state.helpRequests] })),
  
  setSelectedAuthor: (selectedAuthor) => set({ selectedAuthor }),
  setDataLoading: (isDataLoading) => set({ isDataLoading }),
  
  loadAllData: async () => {
    try {
      set({ isDataLoading: true });
      
      const [posts, events, goals, helpRequests] = await Promise.all([
        getPosts(),
        getEvents(), 
        getGoals(),
        getHelpRequests()
      ]);
      
      set({ 
        posts, 
        events, 
        goals, 
        helpRequests, 
        isDataLoading: false 
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isDataLoading: false });
    }
  },
  
  refreshData: async () => {
    await get().loadAllData();
  }
}));