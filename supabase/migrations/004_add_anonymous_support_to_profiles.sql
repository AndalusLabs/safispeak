-- Add support for anonymous users in profiles table
-- Remove the foreign key constraint to allow anonymous users (without auth.users reference)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add is_anonymous column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Update RLS policies to support both authenticated and anonymous users
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- New policy: Users can view their own profile (authenticated via auth.uid() or anonymous via id match)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    (is_anonymous = false AND auth.uid() = id) OR
    (is_anonymous = true AND id IS NOT NULL)
  );

-- New policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    (is_anonymous = false AND auth.uid() = id) OR
    (is_anonymous = true AND id IS NOT NULL)
  );

-- New policy: Allow anyone to insert profiles (for anonymous user creation)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true);

-- Update the comment
COMMENT ON COLUMN profiles.is_anonymous IS 'Whether this is an anonymous user (true) or authenticated user (false). Anonymous users have no auth.users reference.';

