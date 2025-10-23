import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const profileRole = pgEnum("profile_role", ["master", "editor", "user"]);

export const allowedEmails = pgTable(
  "allowed_emails",
  {
    email: text().primaryKey().notNull(),
    role: profileRole().default("editor").notNull(),
    invitedBy: uuid("invited_by"),
    isLoginAllowed: boolean("is_login_allowed").default(true).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [profiles.id],
      name: "allowed_emails_invited_by_profiles_id_fk",
    }).onDelete("set null"),
    pgPolicy("allowed_emails_select_master", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(is_master_email((auth.jwt() ->> 'email'::text)) OR (email = (auth.jwt() ->> 'email'::text)))`,
    }),
    pgPolicy("allowed_emails_insert_master", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("allowed_emails_update_master", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("allowed_emails_delete_master", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    name: text().notNull(),
    role: profileRole().default("user").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("profiles_email_unique").on(table.email),
    pgPolicy("profiles_update_self", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(email = (auth.jwt() ->> 'email'::text))`,
      withCheck: sql`((email = (auth.jwt() ->> 'email'::text)) AND (role = 'editor'::profile_role))`,
    }),
    pgPolicy("profiles_update_master", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("profiles_delete_master", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("profiles_select_self_or_master", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("profiles_insert_master", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
  ],
);
