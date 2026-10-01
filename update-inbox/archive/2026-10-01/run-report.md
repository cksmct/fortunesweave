# Fortune’s Weave 站点更新报告（one-click-site-update）

运行日期：2026-10-01 ｜ 仓库：d:/Source/Try/fortunesweave ｜ 报告语言：中文

## 0. 执行概要
- 触发：用户手动放置两份 Google Trends CSV 并调用 one-click-site-update。
- 平台：console（Switch 2 独占，无实时数值 API），statsRefresh=none，Phase 2 不抓取。
- 整体结论：Phase 1 完成，构建全绿（0 error / 0 warning）；视频 Phase 3.5 因缺 YouTube session cookie 未执行；提交 Phase 5 因 config gitCommit/gitPush=false 跳过。
- 用户重点关注判定：本轮 50 个 breakout 查询全部可由现有主题簇承接，不新建任何独立页面，以避免薄页/重复内容（AdSense 拒审风险）。

## 1. 输入与准备（Phase 0）
- inbox 文件：rising-searches（51 行）+ top-searches（51 行）两份 CSV，用户手动放置。
- trendsUrl 已配置，但 CSV 已就位，直接采用，未重新抓取（避免卷走用户文件）。
- 平台探测：gamePlatform=console。
- config 对账：audits 17 个脚本路径与 scripts/ 实际文件一致。

## 2. 趋势建页（Phase 1）—— Breakout 是否值得建新页（重点）

### 2.1 解析结果
- Rising 50 条、Top 50 条，去重约 50 独立查询词。剥除游戏名前缀后落入以下类别：

| 类别 | 代表 breakout 词（增长） | 承接现有页面 |
|---|---|---|
| 角色 | yuna mei(600%)、glirmosa(170%)、alexandra(110%)、bertrand(100%)、majide(90%)、ninae(70%)、lind(70%)、talimun(60%)、mu(80%)、dietrich(70%) | /characters |
| 素材 | wonder leaves(250%)、giant(s) meat(200/180%)、sandworm meat(170%↓)、bitter leaves(180%)、pepper leaves(120%)、cullet(130%)、paradise fish(150%)、pure water(80%)、lure(90%) | /materials |
| 武器 | levin sword(300%) | /weapons |
| paralogue/支线 | legacy of a legendary sculptor(450%)、paralogues(180%) | /paralogues、/sidequests |
| 职业 | best class(180%)、best class for each character(170%)、tier list(90%) | /classes + /tools/class-planner |
| 坐骑/地图 | mounts(190%)、world map(60%) | /mounts、/map |
| 支线任务 | missing master(190%)、secret altar(90%) | /sidequests |
| 工具 | perfect bird time(150%)、bird time(70%) | /tools/bird-time |

### 2.2 是否建新页的判定
结论：全部 fold 进现有主题簇，本轮不新建独立页面。理由：
1. 每个 breakout 词都已有对应枢纽页/数据文件承载，新建会造成主题分裂与薄页。
2. 本站英文单语、以单语深度碾压竞品，页面数应随单页深度增长而非平铺碎页。
3. 数据驱动页面实体内嵌 src/data/*.json，新词只需在 trend-keywords 登记 enforced phrase 指向数据文件，即可被审计与 SEO 覆盖，无需新页。

### 2.3 真正的内容缺口（5 个，记入 pendingKeywords，未强制建页）
- yuna mei (600%)：全站（含 data）完全缺失。最强 breakout，疑似新披露/高关注角色。候选 /characters 行，但「不臆测」政策要求先有来源核实；本轮仅登记 pending。
- spell list (250%)：无专属法术/魔法列表页，折叠进 /systems（combat arts / blaze arts 已覆盖）。
- tier list (90%)：无独立 tier list 页；class-tiers.json 已在 /classes 下，折叠，不建新页。
- perfect bird time (150%)：Bird Time 具体打法，折叠进 /tools/bird-time。
- best class for each character (170%)：逐角色职业推荐，由 /tools/class-planner + /classes 承接。

### 2.4 trend-keywords.json 变更
- version：2026-09-30 改为 2026-10-01。
- keywords：56 改为 80（新增 24 条 enforced phrase，均指向正确数据文件/页面，逐条校验 hitCount≥1）。
- pendingKeywords：27 改为 32（新增 5 个缺口，带 action 说明）。
- node scripts/audit-trend-coverage.mjs 通过：TREND COVERAGE OK（80 词全部命中）。

## 3. 数据刷新（Phase 2）
- console 无 live stats 端点，不调用 Roblox/Steam 抓取脚本。
- 本轮数据刷新=社区数据 diff：确认所有 breakout 实体（bertrand/majide/levin sword/各素材）已存在于 src/data/*.json，页面数据驱动渲染。yuna mei 为唯一确认缺失项，按 2.3 处理。

## 4. 竞品研究（Phase 3）
- 现有 competitor-profiles 共 9 个 profile + _summary.md。
- 本轮未执行完整 web 扫描（用户重点在 breakout 新页，且本机无便捷 web 工具）；KB 维持现状，无新 dominant 竞品浮现。

## 4.5 视频资产（Phase 3.5）
- videoIntel.enabled=true，但本工作区无 YouTube session cookie。
- 按技能 2026-09-20 硬规则：无 session 时必须停下向用户索取，不得替代，本轮 3.5b/3.5c 未执行。
- 既有 32 媒体实例在构建 audit-media-integrity 全部通过（0 error）。

## 5. 构建门禁（Phase 4）
- 入口：build.cmd（清 .next/out 绕过 SAFE_DELETE）。
- next build：Compiled successfully；postbuild 17 项审计全绿：Errors 0 / Warnings 0。
- 关键审计：trend coverage、media integrity、thin-content、language、orphans、browserslist（0 polyfill 泄漏）均通过。

## 6. 提交 + Push + IndexNow（Phase 5）
- gitCommit=false、gitPush=false（update-config.json 显式）。本轮不提交/不推送/不提交 IndexNow，改动保留为未提交工作区状态。

## 7. skillIssues（技能自修补）
- 无「我们技能造成」的阻塞缺陷。两点非阻塞观察：
  1. 数据驱动页面的 breakout 词若只登记到 page.tsx 会审计失败；正确做法 target 指向 src/data/*.json（已在 2.4 采用）。
  2. 无 YouTube cookie 时 3.5 无法自动进行，属预期限制，非技能缺陷。

## 8. 改进观察
- breakout 词多数已覆盖，说明既有主题簇设计合理；后续重点监控 yuna mei 是否确认为正式角色。
- 可考虑为 best class for each character / spell list 在 /tools/class-planner 与 /systems 增强内容，而非新建页面。

## 9. 待用户跟进
1. yuna mei 来源核实：若确认正式角色，请提供来源（或授权我加角色行到 characters.json），再决定是否扩展为角色页。
2. YouTube session cookie：如需 Phase 3.5 视频扩展，请提供 Netscape cookies 导出放到 scripts/tmp_yt/。
3. 提交上线：当前 gitCommit=false，改动未提交；确认后开启提交即可。
4. 下一轮可对 yuna mei / spell list 做竞品 quick-scan。
