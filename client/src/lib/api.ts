import { queryClient } from "@/lib/queryClient";

const API_BASE = "/api";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  points: number;
  balance: string;
  isPremium: boolean;
  isAdmin: boolean;
  avatarType?: string;
  avatarData?: string;
  bio?: string;
  location?: string;
  totalListeningTime?: number;
  loginStreak?: number;
  createdAt?: string;
}

export interface RadioStation {
  id: string;
  name: string;
  slug: string;
  frequency?: string;
  streamUrl?: string;
  logoUrl?: string;
  pointsPerMinute: number;
  isActive: boolean;
}

export interface ListeningSession {
  id: string;
  userId: string;
  radioStationId?: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  pointsEarned: number;
  isPremiumSession: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: any;
  rewardPoints: number;
  sortOrder: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  progressMax: number;
  isCompleted: boolean;
  completedAt?: string;
  claimedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earning' | 'withdrawal' | 'bonus' | 'referral';
  amount: string;
  points?: number;
  description?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: string;
  points: number;
  pixKey: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  processedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface DailyStats {
  id: string;
  userId: string;
  date: string;
  listeningTime: number;
  pointsEarned: number;
  sessionsCount: number;
}

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      credentials: 'include' // Important for sessions
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  }

  // Auth methods
  async register(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }): Promise<{ user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async login(data: {
    username: string;
    password: string;
  }): Promise<{ user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  // User profile methods
  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return this.request('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async updateAvatar(avatarType: string, avatarData: string): Promise<{ success: boolean }> {
    return this.request('/user/avatar', {
      method: 'PATCH',
      body: JSON.stringify({ avatarType, avatarData })
    });
  }

  // Radio stations
  async getRadioStations(): Promise<{ stations: RadioStation[] }> {
    return this.request('/radio-stations');
  }

  // Listening sessions
  async startListening(stationId: string): Promise<{ session: ListeningSession }> {
    return this.request('/listening/start', {
      method: 'POST',
      body: JSON.stringify({ stationId })
    });
  }

  async endListening(data: {
    sessionId: string;
    duration: number;
    pointsEarned: number;
  }): Promise<{ success: boolean }> {
    return this.request('/listening/end', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getListeningHistory(): Promise<{ sessions: ListeningSession[] }> {
    return this.request('/listening/history');
  }

  // Daily stats
  async getDailyStats(days?: number): Promise<{ stats: DailyStats[] }> {
    const params = days ? `?days=${days}` : '';
    return this.request(`/stats/daily${params}`);
  }

  // Achievements
  async getAchievements(): Promise<{ achievements: Achievement[] }> {
    return this.request('/achievements');
  }

  async getUserAchievements(): Promise<{ achievements: UserAchievement[] }> {
    return this.request('/user/achievements');
  }

  // Transactions
  async getTransactions(limit?: number): Promise<{ transactions: Transaction[] }> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/transactions${params}`);
  }

  // Withdrawals
  async createWithdrawal(data: {
    points: number;
    pixKey: string;
  }): Promise<{ withdrawal: Withdrawal }> {
    return this.request('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getWithdrawals(): Promise<{ withdrawals: Withdrawal[] }> {
    return this.request('/withdrawals');
  }

  // Premium subscription
  async subscribePremium(plan: 'monthly' | 'quarterly' | 'annual'): Promise<any> {
    return this.request('/premium/subscribe', {
      method: 'POST',
      body: JSON.stringify({ plan })
    });
  }

  async getPremiumStatus(): Promise<any> {
    return this.request('/premium/status');
  }

  // Notifications
  async getNotifications(unreadOnly?: boolean): Promise<any> {
    const params = unreadOnly ? '?unread=true' : '';
    return this.request(`/notifications${params}`);
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  // Settings
  async getSettings(): Promise<any> {
    return this.request('/settings');
  }

  async updateSettings(settings: any): Promise<any> {
    return this.request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }
}

export const api = new ApiClient();