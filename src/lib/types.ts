/**
 * 数据模型单一事实源（主机独占垂直的 9 张表）。
 *
 * 铁律：每个「数据行」都必须实现 Sourced —— 来源、分级、核对日期三者缺一不可。
 * 由 scripts/audit-sources.mjs 在构建期强制：任何一行缺 sources[] / grade / asOf 即构建失败。
 * 本项目没有一手游戏来源，因此「可溯源」不是加分项，而是唯一的产品本体。
 */

export type SourceGrade =
  | "official"
  | "cross-checked"
  | "source-reported"
  | "community-reported";

export interface SourceRef {
  /** 来源标识（与 src/data/sources.ts 的 id 对应）或直接写明媒体名 */
  label: string;
  url: string;
  /** 该来源的发布或核对日期（YYYY-MM-DD） */
  date: string;
}

export interface Sourced {
  sources: SourceRef[];
  grade: SourceGrade;
  /** 本行最后一次核对日（YYYY-MM-DD） */
  asOf: string;
  /** 字段级不确定说明，例如 reports differ as of 2026-09-27 */
  note?: string;
}

/** 1. 角色 */
export interface Character extends Sourced {
  id: string;
  slug: string;
  name: string;
  jpName?: string;
  affiliation: string;
  routes: string[];
  playable: boolean;
  joinChapter?: string;
  recruit?: {
    route?: string;
    supportLevel?: string;
    renownRank?: string;
    negotiation?: boolean;
    requirements: string[];
  };
  growths?: Record<string, number>;
  personalSkill?: string;
  baseClass?: string;
  recommendedClasses?: string[];
  supports?: string[];
  gifts?: { liked: string[]; disliked: string[] };
}

/** 2. 职业 */
export interface GameClass extends Sourced {
  id: string;
  slug: string;
  name: string;
  tier: "Beginner" | "Specialty" | "Advanced" | "Master" | "Special";
  weaponTypes: string[];
  certification?: { requirements: string[]; examChapters?: string[] };
  modifiers?: Record<string, number>;
  mastery?: { skill: string; description: string }[];
  mounts?: string[];
  dismount?: boolean;
}

/** 3. 素材与采集点 */
export interface Material extends Sourced {
  id: string;
  slug: string;
  name: string;
  category: "Leaf" | "Fruit" | "Berry" | "Meat" | "Fish" | "Mineral" | "Water" | "Other";
  usedInQuests: string[];
  recipes?: string[];
  locations: {
    area: string;
    spot: string;
    chapterWindow?: string;
    deadline?: string;
    method: "Search" | "Gather" | "Drop" | "Quest" | "Shop";
    fastestTravel?: string;
  }[];
  effects?: { hp?: number; magic?: number; other?: string };
}

/** 4. 礼物 */
export interface Gift extends Sourced {
  id: string;
  slug: string;
  name: string;
  cost?: number;
  obtain: string[];
  bestFor: string[];
  likedBy: string[];
  dislikedBy: string[];
}

/** 5. 支援与恋爱 */
export interface SupportPair extends Sourced {
  a: string;
  b: string;
  levels: ("C" | "B" | "A" | "S")[];
  romance: boolean;
  howToRaise: string[];
  lockedByRoute?: string[];
}

/** 6. 外传 */
export interface Paralogue extends Sourced {
  id: string;
  slug: string;
  name: string;
  unlock: { chapterWindow: string; trigger: string; prerequisite?: string };
  missable: boolean;
  deadline?: string;
  rewards: string[];
  recruitable?: string[];
  difficulty?: string;
}

/** 7. 自由时间活动 / 小游戏 */
export interface Activity extends Sourced {
  id: string;
  slug: string;
  name: string;
  howTo: string[];
  reactions?: { character: string; preferred: string[]; note?: string }[];
  rewards?: string[];
  timing?: string;
}

/** 8. 武器 / 遗物 / 饰品 */
export interface Equipment extends Sourced {
  id: string;
  slug: string;
  name: string;
  type: "Sword" | "Spear" | "Axe" | "Bow" | "Gauntlet" | "Magic" | "Accessory" | "Relic" | "Other";
  might?: number;
  hit?: number;
  crit?: number;
  range?: string;
  effects?: string[];
  obtain: string[];
  equippedBy?: string[];
}

/** 9. 地点 / 地牢 */
export interface Location extends Sourced {
  id: string;
  slug: string;
  name: string;
  kind: "Town" | "Dungeon" | "Field" | "Arena" | "Temple" | "Landmark";
  region: string;
  pins?: { x: number; y: number; label: string; kind: string }[];
  contains?: string[];
  unlock?: string;
}
