import { ProfileAnswer } from '@/lib/profileTemplate';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'dad' | 'eldest' | 'youngest';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  profileAnswers?: ProfileAnswer[];
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
  progress: number;
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

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  owner_id: string;
  owner: User;
  created_at: string;
}

export interface SharePost {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'photo' | 'video' | 'document' | 'event' | 'location';
  author_id: string;
  author: User;
  images?: string[];
  location?: string;
  event_date?: string;
  event_time?: string;
  tags: string[];
  target_audience: 'all' | 'dad' | 'eldest' | 'youngest';
  background_color?: string;
  allow_comments: boolean;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
}

export interface SharePostReaction {
  id: string;
  post_id: string;
  user_id: string;
  type: 'like' | 'love' | 'laugh' | 'surprise' | 'sad' | 'angry';
  created_at: string;
}

export interface SharePostBookmark {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface ShareComment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  author: User;
  parent_id?: string;
  replies?: ShareComment[];
  created_at: string;
  updated_at: string;
}