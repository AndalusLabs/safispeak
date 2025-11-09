-- Add username column to profiles table
ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;

-- Add index for username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, created_at, updated_at)
  VALUES (NEW.id, NULL, NULL, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for username column
COMMENT ON COLUMN profiles.username IS 'Unique username for user identification. Can be null if user prefers to remain anonymous.';
