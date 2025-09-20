import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, type User } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await api.getCurrentUser();
      setUser(user);
    } catch (error) {
      // User is not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user } = await api.login({ email, password });
    setUser(user);
    // Invalidate queries to refresh data
    queryClient.invalidateQueries();
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) => {
    const { user } = await api.register(data);
    setUser(user);
    // Invalidate queries to refresh data
    queryClient.invalidateQueries();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    // Clear all cached data
    queryClient.clear();
    // Redirect to login page
    window.location.href = '/login';
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const { user } = await api.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}