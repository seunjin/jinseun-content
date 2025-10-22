import type { z } from "zod";
import type { ApiClient, ApiRequestOptions } from "./api-client";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TSchema extends z.ZodTypeAny> = Omit<
  ApiRequestOptions<TSchema>,
  "url" | "method" | "schema"
>;

const invoke =
  (method: HttpMethod) =>
  <TSchema extends z.ZodTypeAny>(
    client: ApiClient,
    url: string,
    schema: TSchema,
    options?: RequestOptions<TSchema>,
  ) =>
    client({
      ...(options ?? {}),
      url,
      method,
      schema,
    } as ApiRequestOptions<TSchema>);

/**
 * @description ApiClient 인스턴스를 HTTP 메서드별 헬퍼(get/post/put/patch/delete)로 감싸서 반환합니다.
 * - 모든 호출에서 schema를 제공해야 타입이 유지됩니다.
 * - options에는 body/query/headers 등 공통 ApiRequestOptions를 그대로 전달할 수 있습니다.
 */
export const createHttpHelpers = (client: ApiClient) => {
  const run = (method: HttpMethod) => {
    const fn = invoke(method);
    return <TSchema extends z.ZodTypeAny>(
      url: string,
      schema: TSchema,
      options?: RequestOptions<TSchema>,
    ) => fn(client, url, schema, options);
  };

  return {
    get: run("GET"),
    post: run("POST"),
    put: run("PUT"),
    patch: run("PATCH"),
    delete: run("DELETE"),
  };
};
