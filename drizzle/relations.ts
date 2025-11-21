import { relations } from "drizzle-orm/relations";
import { allowedEmails, categories, posts, profiles } from "./schema";

export const allowedEmailsRelations = relations(allowedEmails, ({ one }) => ({
  profile: one(profiles, {
    fields: [allowedEmails.invitedBy],
    references: [profiles.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  allowedEmails: many(allowedEmails),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));
