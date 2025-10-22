import type { SelectOption } from "@app/types/common/select";

/**
 * 배열에서 선택용 옵션을 추출합니다.
 *
 * - 각 항목이 기본적으로 `label`, `value`, `id` 키를 가진다고 가정합니다.
 * - 설정을 통해 키를 재정의할 수 있습니다.
 * - `includeAll`이 true인 경우, 값이 "all"인 가상 "전체" 옵션이 앞에 추가됩니다.
 * - `dedupeAll`이 true인 경우, 중복을 피하기 위해 값이 `allValue`인 기존 항목이 제거됩니다.
 */

type ExtractConfig<T> = {
  labelKey?: keyof T;
  valueKey?: keyof T;
  idKey?: keyof T;
  includeAll?: boolean;
  allLabel?: string;
  allValue?: string;
  allId?: number;
  /** `items`에서 기존에 존재하는 All 항목(value === allValue)을 제거합니다 */
  dedupeAll?: boolean;
};

export function extractSelectOptions<T extends Record<string, unknown>>(
  items: T[],
  {
    labelKey = "label" as keyof T,
    valueKey = "value" as keyof T,
    idKey = "id" as keyof T,
    includeAll = false,
    allLabel = "전체",
    allValue = "all",
    allId = 0,
    dedupeAll = true,
  }: ExtractConfig<T> = {},
): SelectOption[] {
  // 1) 선택적으로 기존 "all" 항목을 원본 items에서 제거
  const filtered = dedupeAll
    ? items.filter((item) => String(item[valueKey]) !== allValue)
    : items;

  // 2) SelectOption 형태로 매핑
  const base: SelectOption[] = filtered.map((item) => ({
    id: idKey ? (item[idKey] as number | undefined) : undefined,
    label: String(item[labelKey]),
    value: String(item[valueKey]),
  }));

  // 3) 선택적으로 가상 전체 옵션을 앞에 추가
  if (!includeAll) return base;

  const allOption: SelectOption = {
    id: allId,
    label: allLabel,
    value: allValue,
  };
  return [allOption, ...base];
}
