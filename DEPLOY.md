# fortunesweave.online - 交付与部署清单

静态导出站点（Next.js `output: export`）。产物在 `out/`，可直接上传到任意静态托管。
**上线前先跑验收**：`node scripts/accept-delivery.mjs --with-gates`（7 项检查，全绿才上传）。

---

## 1. 本次交付内容

| 项 | 值 |
| --- | --- |
| 域名 / 邮箱 | `https://fortunesweave.online` / `hi@fortunesweave.online` |
| 路由数 | 38（含 8 个交互页） |
| 数据行 | 1563（31 个数据文件，每行带 `sources` / `grade` / `asOf`） |
| 内容语言 | 英文单语（`siteLanguage: en`，无 hreflang / 语种前缀） |
| 门禁 | 18 道 build 门禁 + 11 道反向测试 + 趋势词覆盖门禁 |
| 产物目录 | `out/`（含 `sitemap.xml`、`robots.txt`、`_headers`、`404.html`） |

页面清单：首页 · 数据库（角色 / 职业 / 素材 / 礼物 / 支援 / 外传 / Bird Time / 装备 / 武器 / 地点 / 系统 / 农业 / 战团 / 共餐 / 坐骑 / 阵营 / 纹章 / 英雄天赋 / Notable Deeds / Boons / 神祇 / 支线任务）· 流程（62 章 + 9 外传）· 工具（礼物查询 / 配方求解 / 外传清单 / 转职规划 / 招募规划 / 支援矩阵 / Bird Time 查询 / 示意地图）· 运维（更新 / 关于 / 联系 / 隐私 / 条款）。

---

## 2. 部署到 Cloudflare Pages

```bash
# 方式 A：wrangler 直传（需要 CLOUDFLARE_API_TOKEN 与 account id）
npm run build
npx wrangler pages project create fortunesweave-online
npx wrangler pages deploy out --project-name fortunesweave-online --branch main

# 方式 B：控制台拖拽
#   1. 跑 npm run build
#   2. Cloudflare Dashboard -> Workers & Pages -> Create -> Pages -> Upload assets
#   3. 把 out/ 整个目录拖进去，项目名 fortunesweave-online
```

自定义域：Dashboard -> 该项目 -> Custom domains -> 添加 `fortunesweave.online`（以及 `www`），
按提示在 DNS 添加 CNAME。HTTPS 由 Cloudflare 自动签发。

`_headers` 已随产物上传（缓存与安全头）；若托管平台不识别 `_headers`，把其中的规则改写成该平台的配置（Vercel 用 `vercel.json`，Netlify 用 `_headers`/`netlify.toml`）。

---

## 3. 部署后立即验收（复制即可）

```bash
# 首页与关键页可访问（HTTP 200）
for p in / /characters/ /classes/ /materials/ /gifts/ /supports/ /paralogues/ /activities/ /equipment/ /locations/ /systems/ /walkthrough/ /map/ /updates/ /about/ /contact/ /privacy/ /terms/; do
  printf "%s -> %s\n" "$p" "$(curl -s -o /dev/null -w "%{http_code}" "https://fortunesweave.online$p")"
done

# sitemap 与 robots
curl -s https://fortunesweave.online/sitemap.xml | grep -c "<loc>"      # 期望 38
curl -s https://fortunesweave.online/robots.txt | grep -E "Sitemap|cdn-cgi"

# canonical 与 og:url 一致
curl -s https://fortunesweave.online/characters/ | grep -E "canonical|og:url|twitter:card"
```

---

## 4. 搜索引擎提交

1. **Google Search Console**：添加 `fortunesweave.online`（DNS 或 HTML 文件验证）。用 HTML 文件验证时把文件放到 `public/` 再构建，产物会带上；提交 `sitemap.xml`。
2. **Bing Webmaster**：可直接导入 GSC 站点，或放 IndexNow key 文件到 `public/`（形如 `<key>.txt`），随后：
   ```bash
   # 增量提交（IndexNow，key 文件就绪后）
   node scripts/submit-indexnow.mjs
   ```
   `update-config.json` 里 `indexnow: false` 保持关闭，直到 key 文件就位再打开，避免空提交。
3. 收录预期：新域名通常 1-3 周开始收录、2-6 周开始有排名 —— 这是域名年龄问题，不是内容问题。

---

## 5. 每周更新循环（首发后 1-2 个月的爬升期）

```bash
# 1. 把新的两份 Google Trends CSV 放进 update-inbox/（文件名含 rising / top 即可）
# 2. 重新生成趋势词清单（自动区分「已落地强制」与「缺口待补」）
node scripts/tmp_yt/gen_trend_keywords.mjs
# 3. 打开 scripts/trend-keywords.json，看 pendingKeywords：那是本周该补的内容缺口
# 4. 补数据（新增行必须带 sources / grade / asOf），必要时补竞品复核
# 5. 构建 + 全部门禁（含趋势词覆盖）
npm run build
# 6. 交付验收 + 门禁反向测试
node scripts/accept-delivery.mjs --with-gates
# 7. 部署
npx wrangler pages deploy out --project-name fortunesweave-online --branch main
# 8. 增量提交
node scripts/submit-indexnow.mjs
```

---

## 6. 门禁速查（都在 `package.json` 里，build 自动跑一遍）

```bash
npm run build            # prebuild: 日期生成 + 信任文案 + 数据来源；postbuild: 18 道门禁全串
npm run audit            # 只跑 postbuild 那一串门禁
npm run audit:data       # 数据新鲜度
npm run audit:drift      # 页面数字是否硬编码
npm run audit:media      # 媒体完整性
npm run audit:trends     # 趋势词覆盖（strict）
node scripts/verify-gates.mjs     # 11 道门禁三段式反向测试（干净 0 -> 破坏 1 -> 复原 0）
node scripts/accept-delivery.mjs --with-gates   # 交付验收
```

---

## 7. 已知范围与刻意取舍（不是缺陷，是口径）

- **武器/装备**：`/weapons/` 现在有完整武器与法术表（**101 条**，含 Might/Weight/Hit/Crit/Curse/Range/Uses/Worth/效果），来源是 **fireemblemwiki.org 的武器总表** —— 此前「全网无武器总表」的结论是错的（我只查了 Fandom，那个 wiki 确实没有）。`/equipment/` 继续负责武器类型机制与 29 件具名诅咒之物。
- **竞品调研（2026-09-28）**：已建档 6 家（Game8 / IGN wiki / fireemblemwiki.org / fortunesweave.co.uk / firefortunesweave.com / fortunesweave.wiki），汇总见 `competitor-profiles/_summary.md`。其 sitemap（约 860 URL）显示它的长尾深度在**逐条物品页与 120 条支线详情页**，而本站的差异化在交互工具与字段级溯源。原「Deities / Post-game / 系统类」缺口已在 `/deities/`（12 神）与 `/postgame/`（无终盘、Descend Again、Merge Causality）补齐。
- **素材**：共 **26 行**（Fextralife 原料表 + 肉类 + Pure Water，另加本周 CSV 的四个升序词 **Cullet / Paradise Fish / Dates / Glirmosa**——只有 Cullet 有来源用途（锻造磨刃），其余三件如实登记为「存在但无来源描述」，绝不编造）。`secret altar` 与 `missing master` 不再是缺口：**125 条支线全表**（含章节、地点、奖励、游戏内截止日）落在 `/sidequests/`，Secret Altar 是第 8 章任务地点、Missing Master 是第 9 章优先任务（15/10 截止）。
- **地图**：`/map/` 是**示意索引**（区域按阅读顺序排布 + 地牢图钉），不使用任何官方地图素材。
- **神祇（修正记录）**：`/boons/` 曾写「没有来源公布万神殿」—— 该断言**是错的**，co.uk 的 `/wiki/deities-of-dagda` 确列 12 位神（Sothis / Fortuna / Aurora / Mars / Kalla / Balor / Smyrnos / Jurah / Credna / Yu Phas / Solel / Dagda；Balor 是本作反派）。已在 `/deities/` 落库并改正 boons 页文案：来源只给名字与 5 个领域，其余如实留空。
- **趋势词**：`gen_trend_keywords.mjs` 现强制 **43 词**（本轮新增 deity/god/balor/subquest/quest/missing master/secret altar/cullet/paradise fish/glirmosa/dates），全部落在对应页面的**正文自然句**里；`glirmosa` 是 Breakout 词且确为真实物品（对手 sitemap 有 `/items/glirmosa`），已入素材库。
- **每轮必踩的坑（写给下一轮）**：① `replace_in_file` 偶发报成功但磁盘未变 —— 关键改动用脚本写盘并回读校验；② 趋势门禁要求品牌+词条在**页面源码**相邻（渲染自 JSON 的条目名不计数），新词必须写进正文自然句（参照 materials 页 "Fire Emblem: Fortune&apos;s Weave Cullet is..." 句式）；③ 改 JSON 字段类型前先看首行结构（materials 的 effects 是 string、locations/usedInQuests 是数组）；④ 后台构建会锁 build.log，重跑换日志名。
- **一手验证**：本站数据来自社区权威源 + 媒体 + 视频转录，字段级标注 `Source-reported` / `Cross-checked (n sources)`；**不写** `verified in game` 类声明（我们无法兑现），也**不写**自我否定文案（门禁会拦）。
- **剧透**：来源标记为剧情揭示的内容一律不入库（诅咒之物的真实来历、Dark 变体、相关死亡细节）。
- **广告**：按你的决定首发不带广告，布局里也没有预留槽位。要接 Adsterra 时再补一个标准化广告槽组件与同意面板（非 EEA 静默授予、EEA/UK 弹面板）。
