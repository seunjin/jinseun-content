import { z } from "zod";
import { ApiError } from "./api-client";

export type ApiSuccess<Data, Meta = Record<string, unknown> | undefined> = {
  success: true;
  data: Data;
  meta?: Meta;
  message?: string;
  statusCode?: number;
  correlationId?: string;
};

export type ApiFailure = {
  success: false;
  statusCode: number;
  message?: string;
  correlationId?: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
    fields?: Record<string, string[]>;
  };
};

export type ApiResponse<
  Data = unknown,
  Meta = Record<string, unknown> | undefined,
> = ApiSuccess<Data, Meta> | ApiFailure;

type SuccessSchemaConfig<
  DataSchema extends z.ZodTypeAny,
  MetaSchema extends z.ZodTypeAny | undefined,
> = {
  data: DataSchema;
  meta?: MetaSchema;
  message?: z.ZodTypeAny;
  statusCode?: z.ZodTypeAny;
  correlationId?: z.ZodTypeAny;
};

type FailureSchemaConfig = {
  statusCode?: z.ZodTypeAny;
  message?: z.ZodTypeAny;
  correlationId?: z.ZodTypeAny;
  error?: {
    code?: z.ZodTypeAny;
    message?: z.ZodTypeAny;
    details?: z.ZodTypeAny;
    fields?: z.ZodTypeAny;
  };
};

const optional = (schema?: z.ZodTypeAny, fallback?: () => z.ZodTypeAny) =>
  (schema ?? fallback?.() ?? z.any()).optional();

export const ApiSuccessSchema = <
  DataSchema extends z.ZodTypeAny,
  MetaSchema extends z.ZodTypeAny | undefined = undefined,
>({
  data,
  meta,
  message,
  statusCode,
  correlationId,
}: SuccessSchemaConfig<DataSchema, MetaSchema>) =>
  z.object({
    success: z.literal(true),
    data,
    meta: meta ? meta.optional() : z.undefined().optional(),
    message: optional(message, () => z.string()),
    statusCode: optional(statusCode, () => z.number()),
    correlationId: optional(correlationId, () => z.string()),
  });

export const ApiFailureSchema = ({
  statusCode,
  message,
  correlationId,
  error,
}: FailureSchemaConfig = {}) =>
  z.object({
    success: z.literal(false),
    statusCode: statusCode ?? z.number(),
    message: optional(message, () => z.string()),
    correlationId: optional(correlationId, () => z.string()),
    error: z.object({
      code: error?.code ?? z.string(),
      message: error?.message ?? z.string(),
      details: optional(error?.details, () => z.unknown()),
      fields: optional(error?.fields, () =>
        z.record(z.string(), z.array(z.string())),
      ),
    }),
  });

export const ApiResponseSchema = <
  DataSchema extends z.ZodTypeAny,
  MetaSchema extends z.ZodTypeAny | undefined = undefined,
>(
  config: SuccessSchemaConfig<DataSchema, MetaSchema>,
) =>
  z.discriminatedUnion("success", [
    ApiSuccessSchema(config),
    ApiFailureSchema(),
  ]);

export const isOk = <Data, Meta = Record<string, unknown> | undefined>(
  response: ApiResponse<Data, Meta>,
): response is ApiSuccess<Data, Meta> => response.success;

export const isFailure = <Data, Meta = Record<string, unknown> | undefined>(
  response: ApiResponse<Data, Meta>,
): response is ApiFailure => !response.success;

export function ensureOk<Data, Meta = Record<string, unknown> | undefined>(
  response: ApiResponse<Data, Meta>,
): ApiSuccess<Data, Meta> {
  if (isOk(response)) return response;

  const message =
    response.error?.message ??
    response.message ??
    "알 수 없는 API 오류가 발생했습니다.";

  throw new ApiError(response.statusCode ?? 500, message, {
    snippet: response.error?.code ?? message,
    body: response,
    cause: response.error?.details,
  });
}

export function unwrap<Data, Meta = Record<string, unknown> | undefined>(
  response: ApiResponse<Data, Meta>,
): Data {
  return ensureOk(response).data;
}

type SuccessInput<Data, Meta> = {
  success: true;
  data: Data;
  meta?: Meta;
  message?: string;
  statusCode?: number;
  correlationId?: string;
};

type FailureInput = {
  success: false;
  statusCode: number;
  message?: string;
  correlationId?: string;
  error: ApiFailure["error"];
};

export function createApiResponse<
  Data,
  Meta = Record<string, unknown> | undefined,
>(input: SuccessInput<Data, Meta>): ApiSuccess<Data, Meta>;
export function createApiResponse(input: FailureInput): ApiFailure;
export function createApiResponse<
  Data,
  Meta = Record<string, unknown> | undefined,
>(input: SuccessInput<Data, Meta> | FailureInput): ApiResponse<Data, Meta> {
  if (input.success) {
    return {
      success: true,
      data: input.data,
      meta: input.meta,
      message: input.message,
      statusCode: input.statusCode,
      correlationId: input.correlationId,
    };
  }

  return {
    success: false,
    statusCode: input.statusCode,
    message: input.message,
    correlationId: input.correlationId,
    error: input.error,
  };
}
