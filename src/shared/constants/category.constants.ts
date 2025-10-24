import type { SelectOption } from "@shared/types/common/select";
import { extractSelectOptions } from "@shared/utils/select-options";
import type { ICON_PALETTE } from "@ui/components/lucide-icons/icons-palette";

type ContentCategory = {
  icon: keyof typeof ICON_PALETTE;
} & SelectOption;
export const CONTENT_CATEGORY: ContentCategory[] = [
  {
    id: 1,
    label: "전체",
    value: "all",
    icon: "List",
  },
  {
    id: 2,
    label: "인문학",
    value: "humanity",
    icon: "Lightbulb",
  },
  {
    id: 3,
    label: "스타트업",
    value: "startup",
    icon: "Rocket",
  },
  {
    id: 4,
    label: "IT·프로그래밍",
    value: "programming",
    icon: "CodeXml",
  },
  {
    id: 5,
    label: "서비스·전략 기획",
    value: "planning",
    icon: "Goal",
  },
  {
    id: 6,
    label: "마케팅",
    value: "marketing",
    icon: "ChartNoAxesCombined",
  },
  {
    id: 7,
    label: "디자인·일러스트",
    value: "design",
    icon: "DraftingCompass",
  },
  {
    id: 8,
    label: "자기계발",
    value: "self-development",
    icon: "Footprints",
  },
];
/** 인사이트 카테고리 옵션 (전체 제외) */
export const CONTENT_CATEGORY_SELECT_OPTIONS =
  extractSelectOptions(CONTENT_CATEGORY);
/** 인사이트 카테고리 옵션 (전체 포함) */
export const CONTENT_CATEGORY_SELECT_OPTIONS_WITH_ALL = extractSelectOptions(
  CONTENT_CATEGORY,
  {
    includeAll: true,
  },
);
