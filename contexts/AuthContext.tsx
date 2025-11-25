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

  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
  };

  const performSignOut = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      await AuthService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      clearAuthState();
      if (showLoader) setLoading(false);
    }
  };

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
          emailConfirmedAt: session.user.email_confirmed_at,
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
          emailConfirmedAt: currentUser.email_confirmed_at,
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
    const handleMissingAccount = async () => {
      console.warn('User account missing, signing out.');
      await performSignOut(false);
    };

    try {
      const { data, error } = await AuthService.getUserProfile(userId);
      if (error) {
        console.error('Load profile error:', error);
        await handleMissingAccount();
        return;
      }

      if (data) {
        setProfile(data);
        return;
      }

      const { data: createdProfile, error: createError } = await AuthService.createUserProfile(userId, {
        email: user?.email || undefined,
      });

      if (createError) {
        console.error('Create profile error:', createError);
        // Foreign key violation indicates auth user no longer exists
        if (createError.code === '23503' || createError.message?.includes('foreign key')) {
          await handleMissingAccount();
        }
        return;
      }

      if (createdProfile) {
        setProfile(createdProfile);
      } else {
        await handleMissingAccount();
      }
    } catch (error) {
      console.error('Load profile error:', error);
      await handleMissingAccount();
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
    await performSignOut(true);
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
