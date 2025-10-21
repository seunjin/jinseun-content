import { ICON_PALETTE } from "@components/lib/lucide-icons/icons-palette";
type InsightCategory = {
  id: number;
  label: string;
  category: string;
  icon: keyof typeof ICON_PALETTE;
};
export const INSIGHT_CATEGORY: InsightCategory[] = [
  {
    id: 1,
    label: "전체",
    category: "",
    icon: "List",
  },
  {
    id: 2,
    label: "인문학",
    category: "humanity",
    icon: "Lightbulb",
  },
  {
    id: 3,
    label: "스타트업",
    category: "startup",
    icon: "Rocket",
  },
  {
    id: 4,
    label: "IT·프로그래밍",
    category: "programming",
    icon: "CodeXml",
  },
  {
    id: 5,
    label: "서비스·전략 기획",
    category: "planning",
    icon: "Goal",
  },
  {
    id: 6,
    label: "마케팅",
    category: "marketing",
    icon: "ChartNoAxesCombined",
  },
  {
    id: 7,
    label: "디자인·일러스트",
    category: "design",
    icon: "DraftingCompass",
  },
  {
    id: 8,
    label: "자기계발",
    category: "self-development",
    icon: "Footprints",
  },
];
