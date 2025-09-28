-- Drop all existing problematic policies on profiles
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM public.profiles 
  WHERE user_id = _user_id 
  LIMIT 1;
$$;

-- Create simplified, non-recursive policies
CREATE POLICY "profiles_select_all" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);