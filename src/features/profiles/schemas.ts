import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { allowedEmails, profiles } from "../../../drizzle/schema";

export type ProfileRow = InferSelectModel<typeof profiles>;
export type AllowedEmailRow = InferSelectModel<typeof allowedEmails>;

export const profileRowSchema = createSelectSchema(profiles);
export const allowedEmailRowSchema = createSelectSchema(allowedEmails);

const baseCreateProfileSchema = createInsertSchema(profiles, {
  email: z.email("유효한 이메일을 입력하세요."),
  name: z.string().min(1, "이름은 필수입니다."),
});

export const createProfileInputSchema = baseCreateProfileSchema.pick({
  email: true,
  name: true,
  role: true,
});

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;

export type CreateProfileOptions = {
  invitedByProfileId: string;
};
