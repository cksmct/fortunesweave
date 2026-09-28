import type { SourceGrade } from "@/lib/types";

/**
 * 来源登记表（五层）。
 *
 * 每一层有各自允许支撑的最高证据分级，这条上限是硬规则：
 *  - official            -> official
 *  - community-authoritative -> cross-checked（社区权威站之间可互相印证）
 *  - media               -> cross-checked
 *  - video               -> cross-checked（字幕是机制细节的最细粒度证据）
 *  - community-signal    -> community-reported（只作线索，永不单独成事实）
 *
 * verifiedAt = 本站最后一次用 curl/node 实际访问该 URL 并确认可抓的日期。
 * 新增来源必须先实际访问成功再登记，严禁登记未验证的 URL。
 */

export type SourceKind =
  | "official"
  | "community-authoritative"
  | "media"
  | "video"
  | "community-signal";

export interface SourceEntry {
  id: string;
  label: string;
  url: string;
  kind: SourceKind;
  maxGrade: SourceGrade;
  verifiedAt: string;
  citationRule: string;
}

export const SOURCES: SourceEntry[] = [
  {
    id: "nintendo-store",
    label: "Nintendo official product page",
    url: "https://www.nintendo.com/games/detail/fire-emblem-fortunes-weave-switch-2/",
    kind: "official",
    maxGrade: "official",
    verifiedAt: "2026-09-28",
    citationRule: "可直接支撑 Official 级；引用时给出该页链接。",
  },
  {
    id: "fandom-fe",
    label: "Fire Emblem Wiki (Fandom)",
    url: "https://fireemblem.fandom.com/wiki/Fire_Emblem:_Fortune%27s_Weave",
    kind: "community-authoritative",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "CC-BY-SA 内容：只取事实、自行撰写，禁止整段搬运，页脚需署名来源。",
  },
  {
    id: "fireemblemwiki-org",
    label: "Fire Emblem Wiki (fireemblemwiki.org)",
    url: "https://fireemblemwiki.org/",
    kind: "community-authoritative",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "与 Fandom 交叉印证；两站一致可升 cross-checked。",
  },
  {
    id: "serenes-forest",
    label: "Serenes Forest",
    url: "https://serenesforest.net/fortunes-weave/",
    kind: "community-authoritative",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "系列老牌数据站；其自述「Switch 2 游戏当前无法解包」是本项目数据分级上限的来源。",
  },
  {
    id: "fextralife-fw",
    label: "Fextralife Fortune\u0027s Weave Wiki",
    url: "https://fortunesweave.wiki.fextralife.com/",
    kind: "community-authoritative",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "结构完整但缺少支援/料理等条目；作为交叉源使用，不作为唯一来源。",
  },
  {
    id: "ign-wiki",
    label: "IGN Wiki - Fortune\u0027s Weave",
    url: "https://www.ign.com/wikis/fire-emblem-fortunes-weave",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "有流程/角色/支援/礼物/Bird Time；无职业与道具页，缺口需自行补齐。",
  },
  {
    id: "game8-fw",
    label: "Game8 (English) - Fortune\u0027s Weave",
    url: "https://game8.co/games/Fire-Emblem-Fortunes-Weave",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "页面受 JS 人机校验保护，抓取必须用 curl.exe，web_fetch 会返回空壳。",
  },
  {
    id: "rpg-site",
    label: "RPG Site guides",
    url: "https://www.rpgsite.net/",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "四条路线流程、外传、地牢、地图、NG+ 覆盖较全。",
  },
  {
    id: "keengamer",
    label: "KeenGamer guides",
    url: "https://www.keengamer.com/",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "叶子类素材位置与最佳职业等长尾；node fetch 403，必须 curl。",
  },
  {
    id: "polygon-fw",
    label: "Polygon - Wonder Leaves location",
    url: "https://www.polygon.com/fire-emblem-fortunes-weave-wonder-leaves-location-where-to-find/",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "奇异叶（Wonder Leaves）来源报道之一，与其他两三家交叉使用。",
  },
  {
    id: "vgc-fw",
    label: "Video Games Chronicle guides",
    url: "https://www.videogameschronicle.com/guide/fire-emblem-fortunes-weave-wonder-leaves-location-for-elegant-drink-recipes-quest/",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "任务链细节；与 KeenGamer/Polygon 交叉。",
  },
  {
    id: "pocket-tactics-fw",
    label: "Pocket Tactics - tier list",
    url: "https://www.pockettactics.com/fire-emblem-fortunes-weave/tier-list",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "分级榜方法论可借鉴；其榜单结论必须与其他来源交叉后再引用。",
  },
  {
    id: "thegamer-fw",
    label: "TheGamer - drink ingredient locations",
    url: "https://www.thegamer.com/fire-emblem-fortunes-weave-drink-ingredient-leaves-locations/",
    kind: "media",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "饮品素材位置；作为叶子类素材的交叉源。",
  },
  {
    id: "youtube-guides",
    label: "YouTube guide and playthrough captions",
    url: "https://www.youtube.com/",
    kind: "video",
    maxGrade: "cross-checked",
    verifiedAt: "2026-09-28",
    citationRule: "转录要点必须带视频 id 与时间戳；同一机制需两次独立提及或与媒体交叉方可升级。",
  },
  {
    id: "community-signal",
    label: "Community posts (Reddit / Discord)",
    url: "https://www.reddit.com/r/fireemblem/",
    kind: "community-signal",
    maxGrade: "community-reported",
    verifiedAt: "2026-09-28",
    citationRule: "只作线索，永不单独成事实；升级前必须找到第二个可引用来源。",
  },
];

export function getSource(id: string): SourceEntry | undefined {
  return SOURCES.find((entry) => entry.id === id);
}

export function getSourcesByKind(kind: SourceKind): SourceEntry[] {
  return SOURCES.filter((entry) => entry.kind === kind);
}
