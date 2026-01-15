-- Add user_id column to members table if it doesn't exist
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS (already enabled in setup, but good to ensure)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON members 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to update their own profile (optional, for settings)
CREATE POLICY "Users can update own profile" 
ON members 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);
-- Note: You might need to adjust the existing "Admin Update Members" policy or ensure it doesn't conflict, 
-- though Supabase usually allows multiple permissive policies.

-- Allow users to insert their own profile during registration (if we do client-side insert)
-- Ideally, we might want to restrict this so they can only insert if auth.uid() matches
CREATE POLICY "Users can insert own profile" 
ON members 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);
