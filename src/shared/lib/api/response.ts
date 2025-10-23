import type { ApiErrorCode } from "./error-codes";
import type { ApiError, ApiSuccess } from "./types";

type RequestIdentifiers = {
  requestId: string;
  traceId: string;
};

type RequestIdentifierInput = Partial<RequestIdentifiers>;

const generateIdentifier = () => {
  const possibleCrypto = (
    globalThis as { crypto?: { randomUUID?: () => string } }
  ).crypto;
  if (possibleCrypto && typeof possibleCrypto.randomUUID === "function") {
    return possibleCrypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * @description 요청/트레이스 ID를 생성하거나 전달받은 값을 채웁니다.
 */
const ensureRequestIdentifiers = (
  identifiers: RequestIdentifierInput = {},
): RequestIdentifiers => ({
  requestId: identifiers.requestId ?? generateIdentifier(),
  traceId: identifiers.traceId ?? generateIdentifier(),
});

type CreateSuccessOptions<TMeta> = RequestIdentifierInput & {
  meta?: TMeta extends never ? undefined : TMeta;
};

/**
 * @description API 성공 응답 객체를 생성합니다.
 */
export const createApiSuccess = <TData, TMeta = never>(
  data: TData,
  options: CreateSuccessOptions<TMeta> = {},
): ApiSuccess<TData, TMeta> => {
  const identifiers = ensureRequestIdentifiers(options);
  const payload: ApiSuccess<TData, TMeta> = {
    data,
    requestId: identifiers.requestId,
    traceId: identifiers.traceId,
  };

  if (options.meta !== undefined) {
    payload.meta = options.meta;
  }

  return payload;
};

type CreateErrorOptions<TDetails> = RequestIdentifierInput & {
  code: ApiErrorCode;
  message: string;
  details?: TDetails;
};

/**
 * @description API 오류 응답 객체를 생성합니다.
 */
export const createApiError = <TDetails = unknown>(
  options: CreateErrorOptions<TDetails>,
): ApiError => {
  const identifiers = ensureRequestIdentifiers(options);
  return {
    requestId: identifiers.requestId,
    traceId: identifiers.traceId,
    error: {
      code: options.code,
      message: options.message,
      details: options.details,
    },
  };
};
