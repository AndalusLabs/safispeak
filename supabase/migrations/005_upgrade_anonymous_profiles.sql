-- Add support columns for linking auth users to existing anonymous profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Ensure we can quickly map auth users back to their profile rows
CREATE UNIQUE INDEX IF NOT EXISTS profiles_auth_user_id_idx
  ON profiles(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Backfill auth_user_id for existing non-anonymous users so lookups keep working
UPDATE profiles
SET auth_user_id = id
WHERE auth_user_id IS NULL
  AND is_anonymous = false;

-- Refresh RLS policies to rely on auth_user_id when available
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (
    (is_anonymous = true AND auth.uid() IS NOT NULL) OR
    (auth.uid() = COALESCE(auth_user_id, id))
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (
    (is_anonymous = true AND auth.uid() IS NOT NULL) OR
    (auth.uid() = COALESCE(auth_user_id, id))
  );

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = COALESCE(auth_user_id, id));

-- Update trigger to reuse anonymous profiles when account is upgraded
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  upgrade_profile_id uuid;
BEGIN
  upgrade_profile_id := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'profile_id', '')), '')::uuid;

  IF upgrade_profile_id IS NOT NULL THEN
    UPDATE public.profiles AS p
    SET auth_user_id = NEW.id,
        is_anonymous = false,
        email = COALESCE(NEW.email, p.email),
        username = COALESCE(p.username, NEW.raw_user_meta_data->>'preferred_username'),
        display_name = COALESCE(p.display_name, NEW.raw_user_meta_data->>'preferred_username'),
        updated_at = NOW()
    WHERE p.id = upgrade_profile_id;

    IF FOUND THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, auth_user_id, display_name, username, email, created_at, updated_at, is_anonymous)
  VALUES (NEW.id, NEW.id, NULL, NULL, NEW.email, NOW(), NOW(), false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

