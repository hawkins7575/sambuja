export interface User {
  id: string;
  email: string;
  name: string;
  role: 'dad' | 'eldest' | 'youngest';
  avatar_url?: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: User;
  target_audience: 'all' | 'dad' | 'eldest' | 'youngest' | string;
  category: 'communication' | 'help' | 'general';
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  target_type: 'post' | 'help' | 'event' | 'goal';
  target_id: string;
  author_id: string;
  author: User;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  target_audience: 'all' | 'dad' | 'eldest' | 'youngest' | string;
  created_by: string;
  creator: User;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  owner_id: string;
  owner: User;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  target_audience: 'all' | 'dad' | 'eldest' | 'youngest' | string;
  status: 'open' | 'in_progress' | 'completed';
  requester_id: string;
  requester: User;
  helper_id?: string;
  helper?: User;
  created_at: string;
  updated_at: string;
}