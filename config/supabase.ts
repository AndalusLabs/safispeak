// Supabase Configuration

// Read directly from environment variables.
// In preview mode (no .env) we fall back to placeholders instead of crashing —
// the v2 redesign stores progress on-device and works without Supabase.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'preview-placeholder-key';
const supabaseBucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || 'safispeak_audio';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars not set — running in preview mode without a backend.');
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
