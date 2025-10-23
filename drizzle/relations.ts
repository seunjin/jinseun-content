import { relations } from "drizzle-orm/relations";
import { allowedEmails, profiles } from "./schema";

export const allowedEmailsRelations = relations(allowedEmails, ({ one }) => ({
  profile: one(profiles, {
    fields: [allowedEmails.invitedBy],
    references: [profiles.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  allowedEmails: many(allowedEmails),
}));
