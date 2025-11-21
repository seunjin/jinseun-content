import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
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
    pgPolicy("allowed_emails_update_master", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`is_master_email((auth.jwt() ->> 'email'::text))`,
      withCheck: sql`is_master_email((auth.jwt() ->> 'email'::text))`,
    }),
    pgPolicy("allowed_emails_select_master", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("allowed_emails_insert_master", {
      as: "permissive",
      for: "insert",
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
    pgPolicy("profiles_delete_master", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 50 }).notNull(),
    slug: varchar({ length: 60 }).notNull(),
    description: text(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("categories_slug_key").on(table.slug),
    pgPolicy("categories_delete_master", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`is_master_email((auth.jwt() ->> 'email'::text))`,
    }),
    pgPolicy("categories_update_master", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("categories_insert_master", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("categories_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: serial().primaryKey().notNull(),
    categoryId: integer("category_id").notNull(),
    title: varchar({ length: 200 }).notNull(),
    slug: varchar({ length: 200 }).notNull(),
    description: text(),
    keywords: text().array(),
    thumbnailUrl: text("thumbnail_url"),
    content: text(),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "posts_category_id_fkey",
    }),
    unique("posts_slug_key").on(table.slug),
    pgPolicy("posts_delete_master", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`is_master_email((auth.jwt() ->> 'email'::text))`,
    }),
    pgPolicy("posts_update_master", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("posts_insert_master", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("posts_select_published", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);
