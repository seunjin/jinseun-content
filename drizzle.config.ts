import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "SUPABASE_DATABASE_URL 환경 변수가 설정되어 있어야 Drizzle introspect를 실행할 수 있습니다.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
  introspect: {
    casing: "camel",
  },
});
