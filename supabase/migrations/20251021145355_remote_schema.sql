


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."profile_role" AS ENUM (
    'master',
    'editor',
    'user'
);


ALTER TYPE "public"."profile_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_master_email"("check_email" "text") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.allowed_emails ae
    WHERE ae.email = check_email
      AND ae.role = 'master'
      AND ae.is_login_allowed = true
  );
$$;


ALTER FUNCTION "public"."is_master_email"("check_email" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."allowed_emails" (
    "email" "text" NOT NULL,
    "role" "public"."profile_role" DEFAULT 'editor'::"public"."profile_role" NOT NULL,
    "invited_by" "uuid",
    "is_login_allowed" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."allowed_emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "role" "public"."profile_role" DEFAULT 'user'::"public"."profile_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."allowed_emails"
    ADD CONSTRAINT "allowed_emails_pkey" PRIMARY KEY ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."allowed_emails"
    ADD CONSTRAINT "allowed_emails_invited_by_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE "public"."allowed_emails" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "allowed_emails_delete_master" ON "public"."allowed_emails" FOR DELETE USING ("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "allowed_emails_insert_master" ON "public"."allowed_emails" FOR INSERT WITH CHECK ("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "allowed_emails_select_master" ON "public"."allowed_emails" FOR SELECT USING (("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")) OR ("email" = ("auth"."jwt"() ->> 'email'::"text"))));



CREATE POLICY "allowed_emails_update_master" ON "public"."allowed_emails" FOR UPDATE USING ("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text"))) WITH CHECK ("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_master" ON "public"."profiles" FOR DELETE USING ("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "profiles_insert_master" ON "public"."profiles" FOR INSERT WITH CHECK (("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")) AND (EXISTS ( SELECT 1
   FROM "public"."allowed_emails" "ae"
  WHERE (("ae"."email" = "profiles"."email") AND ("ae"."is_login_allowed" = true))))));



CREATE POLICY "profiles_select_self_or_master" ON "public"."profiles" FOR SELECT USING (("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")) OR ("email" = ("auth"."jwt"() ->> 'email'::"text"))));



CREATE POLICY "profiles_update_master" ON "public"."profiles" FOR UPDATE USING ("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text"))) WITH CHECK ("public"."is_master_email"(("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "profiles_update_self" ON "public"."profiles" FOR UPDATE USING (("email" = ("auth"."jwt"() ->> 'email'::"text"))) WITH CHECK ((("email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("role" = 'editor'::"public"."profile_role")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."is_master_email"("check_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_master_email"("check_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_master_email"("check_email" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."allowed_emails" TO "anon";
GRANT ALL ON TABLE "public"."allowed_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."allowed_emails" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;

