import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '../config/supabase';

// Validate environment variables before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is missing. Please check your .env file.');
}

// Create Supabase client with AsyncStorage for session persistence
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface UserProfile {
  id: string;
  display_name?: string | null;
  username?: string | null;
  email?: string | null;
  is_anonymous?: boolean | null;
  auth_user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  provider: string;
  emailConfirmedAt?: string | null;
}

export class AuthService {
  // Sign up with email and password
  static async signUpWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://safispeak.app/auth/callback', // We'll handle redirects in the app
        },
      });

      if (error) throw error;

      // Create profile if user was created
      if (data.user) {
        await this.createUserProfile(data.user.id, { email: data.user.email });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  // Sign up with magic link (passwordless)
  static async signUpWithMagicLink(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://safispeak.app/auth/callback', // We'll handle redirects in the app
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Magic link error:', error);
      return { data: null, error };
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://safispeak.app/auth/callback', // We'll handle redirects in the app
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: null, error };
    }
  }

  // Sign in with Apple
  static async signInWithApple() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'https://safispeak.app/auth/callback', // We'll handle redirects in the app
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Apple sign in error:', error);
      return { data: null, error };
    }
  }

  // Create user profile in profiles table
  static async createUserProfile(
    userId: string,
    overrides?: Partial<Omit<UserProfile, 'id'>>
  ) {
    try {
      const timestamp = new Date().toISOString();
      const payload: UserProfile = {
        id: userId,
        created_at: overrides?.created_at || timestamp,
        updated_at: timestamp,
        display_name: overrides?.display_name ?? null,
        username: overrides?.username ?? null,
        email: overrides?.email ?? null,
        is_anonymous: overrides?.is_anonymous ?? false,
        auth_user_id: overrides?.auth_user_id ?? userId,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create profile error:', error);
      return { data: null, error };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        // Don't log session missing errors as they're normal
        if (error.message.includes('Auth session missing')) {
          return { user: null, error: null };
        }
        throw error;
      }
      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},auth_user_id.eq.${userId}`)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      if (error?.code === 'PGRST116') {
        return { data: null, error: null };
      }
      console.error('Get profile error:', error);
      return { data: null, error };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  }
}

export default supabase;
