import type { Database } from "@lib/supabase/database.types";
import { z } from "zod";

/**
 * @description 프로필 테이블 역할 타입입니다.
 */
export type ProfileRole = Database["public"]["Enums"]["profile_role"];

/**
 * @description 프로필 조회 결과 타입입니다.
 */
export type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: ProfileRole;
  createdAt: string;
  updatedAt: string;
};

/**
 * @description 허용 이메일 조회 결과 타입입니다.
 */
export type AllowedEmailRow = {
  id: number;
  email: string;
  createdAt: string;
};

/**
 * @description 프로필 행을 검증하는 스키마입니다.
 */
export const profileRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["master", "editor", "user"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * @description 허용 이메일 행을 검증하는 스키마입니다.
 */
export const allowedEmailRowSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  createdAt: z.string(),
});

/**
 * @description 프로필 생성을 검증하는 스키마입니다.
 */
export const createProfileInputSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요."),
  name: z.string().min(1, "이름은 필수입니다."),
  role: z.enum(["master", "editor", "user"]).default("user"),
});

/**
 * @description createProfile 입력 타입 정의
 */
export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;

/**
 * @description createProfile 호출 시 전달되는 옵션 구조입니다.
 */
export type CreateProfileOptions = {
  invitedByProfileId: string;
};
