-- RLS Performance Optimization (Final Fix)
-- 1. Use subquery caching: (SELECT auth.<function>())
-- 2. Explicitly target 'authenticated' role to avoid 'anon' role overhead and warnings
-- 3. Merge multiple permissive policies on the same table/action

-- ==========================================
-- 1. profiles Table
-- ==========================================
-- Merge multiple permissive UPDATE policies into one to reduce evaluation overhead
DROP POLICY IF EXISTS "profiles_update_master" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_update_self" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_update_master_or_self" ON "public"."profiles";

CREATE POLICY "profiles_update_master_or_self" ON "public"."profiles" 
FOR UPDATE 
TO authenticated
USING (
  public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text))
  OR (email = ((SELECT auth.jwt()) ->> 'email'::text))
)
WITH CHECK (
  public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text))
  OR (
    email = ((SELECT auth.jwt()) ->> 'email'::text) 
    AND role = 'editor'::public.profile_role
  )
);

-- Optimize other profile policies
DROP POLICY IF EXISTS "profiles_delete_master" ON "public"."profiles";
CREATE POLICY "profiles_delete_master" ON "public"."profiles" FOR DELETE TO authenticated USING ("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text")));

DROP POLICY IF EXISTS "profiles_insert_master" ON "public"."profiles";
CREATE POLICY "profiles_insert_master" ON "public"."profiles" FOR INSERT TO authenticated WITH CHECK (("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text")) AND (EXISTS ( SELECT 1 FROM "public"."allowed_emails" "ae" WHERE (("ae"."email" = "profiles"."email") AND ("ae"."is_login_allowed" = true))))));

DROP POLICY IF EXISTS "profiles_select_self_or_master" ON "public"."profiles";
CREATE POLICY "profiles_select_self_or_master" ON "public"."profiles" FOR SELECT TO authenticated USING (("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text")) OR ("email" = ((SELECT "auth"."jwt"()) ->> 'email'::"text"))));


-- ==========================================
-- 2. posts Table
-- ==========================================
-- Fix the 'posts_insert_master' issue specifically mentioned
DROP POLICY IF EXISTS "posts_insert_master" ON "public"."posts";
CREATE POLICY "posts_insert_master" ON "public"."posts" 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text)));

DROP POLICY IF EXISTS "posts_update_master" ON "public"."posts";
CREATE POLICY "posts_update_master" ON "public"."posts" 
FOR UPDATE 
TO authenticated 
USING (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text))) 
WITH CHECK (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text)));

DROP POLICY IF EXISTS "posts_delete_master" ON "public"."posts";
CREATE POLICY "posts_delete_master" ON "public"."posts" 
FOR DELETE 
TO authenticated 
USING (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text)));

-- Optimize select policy
DROP POLICY IF EXISTS "posts_select_master_or_published" ON "public"."posts";
CREATE POLICY "posts_select_master_or_published" ON "public"."posts" 
FOR SELECT 
USING (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text)) OR is_published = true);


-- ==========================================
-- 3. allowed_emails Table
-- ==========================================
DROP POLICY IF EXISTS "allowed_emails_delete_master" ON "public"."allowed_emails";
CREATE POLICY "allowed_emails_delete_master" ON "public"."allowed_emails" FOR DELETE TO authenticated USING ("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text")));

DROP POLICY IF EXISTS "allowed_emails_insert_master" ON "public"."allowed_emails";
CREATE POLICY "allowed_emails_insert_master" ON "public"."allowed_emails" FOR INSERT TO authenticated WITH CHECK ("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text")));

DROP POLICY IF EXISTS "allowed_emails_select_master" ON "public"."allowed_emails";
CREATE POLICY "allowed_emails_select_master" ON "public"."allowed_emails" FOR SELECT TO authenticated USING (("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text")) OR ("email" = ((SELECT "auth"."jwt"()) ->> 'email'::"text"))));

DROP POLICY IF EXISTS "allowed_emails_update_master" ON "public"."allowed_emails";
CREATE POLICY "allowed_emails_update_master" ON "public"."allowed_emails" FOR UPDATE TO authenticated USING ("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text"))) WITH CHECK ("public"."is_master_email"(((SELECT "auth"."jwt"()) ->> 'email'::"text")));


-- ==========================================
-- 4. categories Table
-- ==========================================
DROP POLICY IF EXISTS "categories_insert_master" ON "public"."categories";
CREATE POLICY "categories_insert_master" ON "public"."categories" FOR INSERT TO authenticated WITH CHECK (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text)));

DROP POLICY IF EXISTS "categories_update_master" ON "public"."categories";
CREATE POLICY "categories_update_master" ON "public"."categories" FOR UPDATE TO authenticated USING (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text))) WITH CHECK (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text)));

DROP POLICY IF EXISTS "categories_delete_master" ON "public"."categories";
CREATE POLICY "categories_delete_master" ON "public"."categories" FOR DELETE TO authenticated USING (public.is_master_email(((SELECT auth.jwt()) ->> 'email'::text)));


-- ==========================================
-- 5. storage.objects (Asset bucket)
-- ==========================================
DROP POLICY IF EXISTS "assets_authenticated_insert" ON storage.objects;
CREATE POLICY "assets_authenticated_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets' AND (SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "assets_authenticated_update" ON storage.objects;
CREATE POLICY "assets_authenticated_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets' AND (SELECT auth.role()) = 'authenticated') WITH CHECK (bucket_id = 'assets' AND (SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "assets_authenticated_delete" ON storage.objects;
CREATE POLICY "assets_authenticated_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets' AND (SELECT auth.role()) = 'authenticated');
