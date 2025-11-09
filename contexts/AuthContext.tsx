import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthService, AuthUser, UserProfile } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata?.provider || 'email',
        });
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      const { user: currentUser, error } = await AuthService.getCurrentUser();
      if (error) {
        // No active session - this is normal for first-time users
        console.log('No active session found:', error);
        return;
      }
      
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          provider: currentUser.app_metadata?.provider || 'email',
        });
        await loadUserProfile(currentUser.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data } = await AuthService.getUserProfile(userId);
      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        await AuthService.createUserProfile(userId, user?.email || '');
        // Reload profile
        const { data: newProfile } = await AuthService.getUserProfile(userId);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await AuthService.signUpWithEmail(email, password);
      if (error) {
        return { success: false, error: (error as any).message || 'Unknown error' };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await AuthService.signUpWithEmail(email, password);
      if (error) {
        return { success: false, error: (error as any).message || 'Unknown error' };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
