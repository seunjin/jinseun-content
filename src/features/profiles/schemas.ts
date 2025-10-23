import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { allowedEmails, profiles } from "../../../drizzle/schema";

/**
 * @description 프로필 테이블 select 결과 타입입니다.
 * - Supabase SDK가 반환하는 데이터에 타입 정보를 부여하기 위해 사용합니다.
 */
export type ProfileRow = InferSelectModel<typeof profiles>;

/**
 * @description 허용 이메일 테이블 select 결과 타입입니다.
 */
export type AllowedEmailRow = InferSelectModel<typeof allowedEmails>;

/**
 * @description 프로필 select 결과를 검증하는 Zod 스키마입니다.
 */
export const profileRowSchema = createSelectSchema(profiles);

/**
 * @description 허용 이메일 select 결과를 검증하는 Zod 스키마입니다.
 */
export const allowedEmailRowSchema = createSelectSchema(allowedEmails);

/**
 * @description 프로필 생성 시 입력 유효성을 검증하기 위한 기본 스키마입니다.
 * - 이메일 형식과 이름 최소 길이를 한글 메시지로 안내합니다.
 */
const baseCreateProfileSchema = createInsertSchema(profiles, {
  email: z.email("유효한 이메일을 입력하세요."),
  name: z.string().min(1, "이름은 필수입니다."),
});

/**
 * @description createProfile 액션에서 사용할 입력 스키마입니다.
 * - 필요한 필드만 선택해 클라이언트/서버 공통으로 활용합니다.
 */
export const createProfileInputSchema = baseCreateProfileSchema.pick({
  email: true,
  name: true,
  role: true,
});

/**
 * @description createProfile 입력 타입 정의
 */
export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;

/**
 * @description createProfile 호출 시 전달되는 옵션 구조입니다.
 * - 초대한 관리자 프로필 ID를 포함합니다.
 */
export type CreateProfileOptions = {
  invitedByProfileId: string;
};
