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
      const state = get();
      if (state.users.length > 0) {
        // 이미 로드된 경우 중복 호출 방지
        return;
      }

      const users = await getUsers();
      set({ users });
    } catch (error) {
      console.error('Failed to load users from Firebase, using fallback:', error);
      
      // Firebase 실패 시 기본 사용자 데이터 사용
      const defaultUsers = [
        {
          id: '1',
          name: '아빠',
          email: 'dad@sambuja.com',
          phone: '010-1234-5678',
          role: 'dad' as const,
          created_at: new Date().toISOString(),
        },
        {
          id: '2', 
          name: '짱남',
          email: 'eldest@sambuja.com',
          phone: '010-2345-6789',
          role: 'eldest' as const,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: '막뚱이', 
          email: 'youngest@sambuja.com',
          phone: '010-3456-7890',
          role: 'youngest' as const,
          created_at: new Date().toISOString(),
        }
      ];
      
      set({ users: defaultUsers });
    }
  },
  
  initializeApp: async () => {
    try {
      const state = get();
      if (state.isInitialized) {
        return;
      }
      
      set({ isLoading: true });
      
      try {
        // 데이터베이스 초기화 시도 (문제 발생 시 계속 진행)
        await initializeDatabase();
        console.log('Database initialization completed');
      } catch (dbError) {
        console.warn('Database initialization failed, continuing with app initialization:', dbError);
      }
      
      try {
        // 사용자 목록 로드 - 실패해도 계속 진행
        await get().loadUsers();
      } catch (usersError) {
        console.warn('Users loading failed, continuing with fallback data:', usersError);
      }
      
      set({ isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // 최소한 앱은 작동하도록 함
      set({ isLoading: false, isInitialized: true });
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
    const state = get();
    if (state.isDataLoading) return; // Prevent duplicate requests
    
    try {
      set({ isDataLoading: true });
      
      // Firebase 데이터 로드 시도
      const [posts, events, goals, helpRequests] = await Promise.all([
        getPosts().catch(error => {
          console.warn('Failed to load posts:', error);
          return [];
        }),
        getEvents().catch(error => {
          console.warn('Failed to load events:', error);
          return [];
        }),
        getGoals().catch(error => {
          console.warn('Failed to load goals:', error);
          return [];
        }),
        getHelpRequests().catch(error => {
          console.warn('Failed to load help requests:', error);
          return [];
        })
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
      // 실패 시 빈 배열로 초기화
      set({ 
        posts: [], 
        events: [], 
        goals: [], 
        helpRequests: [], 
        isDataLoading: false 
      });
    }
  },
  
  refreshData: async () => {
    await get().loadAllData();
  }
}));