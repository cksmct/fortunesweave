import gameConfig from '@/data/game.config.json';

export interface RouteEntry {
  path: string;
  title: string;
  priority?: string;
  changeFrequency?: string;
}

export interface GameConfig {
  game: {
    name: string;
    fullName: string;
    slug: string;
    developer: string;
    publisher: string;
    genre: string;
    platforms: string[];
    releaseDate: string;
    currentVersion: string;
    lastUpdated: string;
    officialUrl: string;
  };
  seo: {
    siteName: string;
    titleSuffix: string;
    siteTitle: string;
    siteDescription: string;
    baseUrl: string;
    email: string;
    primaryKeywords: string[];
    secondaryKeywords: string[];
    defaultOgImage: string;
  };
  author: {
    entity: string;
    name: string;
    org: string;
    description: string;
    disambiguatingDescription: string;
    maintainer: string;
    maintainerRole: string;
    sameAs: string[];
  };
  socials: Record<string, string>;
  features: Record<string, boolean>;
  routes: RouteEntry[];
  stats?: { verifiedDate?: string } & Record<string, unknown>;
}

export function getGameConfig(): GameConfig {
  return gameConfig as unknown as GameConfig;
}

export function getRoutes(): RouteEntry[] {
  const config = getGameConfig();
  return config.routes ?? [];
}

export function getSiteUrl(): string {
  return getGameConfig().seo.baseUrl;
}

/**
 * 主机独占（console）站没有实时数值数据源，本函数恒为 false。
 * 保留此函数是为了让依赖它的组件在将来接入任何数据源时不必改调用点；
 * 严禁为了让它返回 true 而伪造 stats 字段（会把"数据快照日期"变成假信号）。
 */
export function hasLiveStats(): boolean {
  const config = getGameConfig();
  return Boolean(config.stats && config.stats.verifiedDate);
}
