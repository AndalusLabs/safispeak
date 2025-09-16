// Supabase Configuration

// Read directly from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseBucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || 'safispeak_audio';

// Debug: Log the environment variables
console.log('Environment variables:', {
  supabaseUrl: supabaseUrl ? 'SET' : 'NOT_SET',
  supabaseAnonKey: supabaseAnonKey ? 'SET' : 'NOT_SET',
  supabaseBucket: supabaseBucket
});

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL is required but not set in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required but not set in environment variables');
}

export const SUPABASE_CONFIG = {
  url: supabaseUrl || 'MISSING_ENV_VARIABLE',
  anonKey: supabaseAnonKey || 'MISSING_ENV_VARIABLE',
  bucket: supabaseBucket,
};

// Export individual variables for authService
export { supabaseAnonKey, supabaseUrl };

// Instructions for secure setup:
// 1. Create a .env file in your project root
// 2. Add: EXPO_PUBLIC_SUPABASE_URL=https://zgrdjsqvgckpfntwdhri.supabase.co
// 3. Add: EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
// 4. Update this file to use: process.env.EXPO_PUBLIC_SUPABASE_URL
// 5. Add .env to your .gitignore file
