# 一键站点更新 · 运行报告（Fortune's Weave Wiki）

- **运行日期**：2026-10-14
- **技能**：one-click-site-update
- **站点域名**：fortunesweave.online（Canonical site domain）
- **游戏平台**：console（Nintendo Switch 2 独占，无 live stats / 无虚拟事件 API）
- **趋势窗口**：2026-10-07 → 2026-10-14（US 地理，用户提供 CSV 于 update-inbox 根，未调用 fetch-trends）
- **Git**：gitCommit=false / gitPush=false → 本运行不提交、不推送（按配置）；HEAD 仍为 `fdff97c`

---

## 1. 运行概览 / 执行契约

| Phase | 状态 | 证据 |
|---|---|---|
| 0 准备（配置/域名/平台/批次门禁） | done | inbox-batch-check.mjs exit 0（窗口 2026-10-07→2026-10-14，stale=0 天，fresh） |
| 1 趋势分析 + 扩词建页 | done | trend-keywords.json 升版 2026-10-14；audit-trend-coverage.mjs exit 0（132 关键词全命中） |
| 2 数据刷新 | no-op-console | console 平台无 stats 端点；statsRefresh=none、statsTarget="" → 按铁律跳过抓取 |
| 3 竞品研究 | light | 站已成熟（30+ 内容目录）；本周无新竞品信号，未做整轮重 profiling |
| 3.5 视频资产 | media-audit-only | 3.5a 媒体审计 exit 0（embed 全部核验、无死链/伪造标题/跨页重复）；3.5b/3.5c 本轮 defer（见 §6） |
| 4 Build 硬门禁 | done | `npm run build` EXIT=0，48 个静态页，媒体/趋势/范围泄漏审计全绿，`❌ Errors: 0` |
| 5 提交/推送/IndexNow | skipped-config-false | gitCommit/gitPush=false；indexnow=true 但无部署，按契约不发 |
| 6 竞品建档 | done | 无新竞品，维持既有 competitor-profiles（13 份） |
| 7 归档 + 校验 | done | verify-run.mjs 终校验（见 §9） |

**本轮新建独立页：0 个。** 新增 material 行：0。

---

## 2. 用户重点关注：Breakout（rising）项是否值得建新页

**结论：本周边际上升词（rising/breakout）全部不值得建独立新页 —— 与过去 7 周（2026-08-27 起）的判定一致。**

判定依据（价值门槛 + 零编造政策）：

1. **绝对搜索量近乎为零**：本批 rising 项的相对搜索热度（0–100 标度）集中在 **0–4**，仅极少数到 7（fe fortune's weave）。预期增量点击远低于 20/月 建页价值门槛。高 breakout 百分比（如 pepper leaves location +1,000%、paralogue guide +100%）是建立在**近零基数**上的高倍率，绝对量仍可忽略。
2. **全部已落到既有 hub/专页**：逐一比对现有 `src/data/*.json` 与 `src/app/**` 后，每个 breakout 词要么已是已存在的实体（材料/职业/任务/地区/角色），要么其意图已被现有专页覆盖（见下表）。
3. **唯一"新名字"（angelica / war arc）无来源**：按本站零编造铁律，未核实的实体不得写入内容，更不得建页（建页即薄页/编造风险）。

### 本批 breakout 逐项判定

| 查询（breakout） | 涨幅 | 热度 | 判定 | 落点 |
|---|---|---|---|---|
| pepper leaves location | +1,000% | 0 | COVERED | `materials.json` 已有 Pepper Leaves；"location" 是同主题更高具体度，解析到材料 hub，不重复建页 |
| paralogue guide | +100% | 0 | COVERED | 已有专页 `/paralogues/`，意图相同 |
| lazanibata | +100% | 0 | UNVERIFIED | 延续既往日志（2026-10-05 起 pending）；无第二独立来源，不建页 |
| wonder leaf | +80% | 0 | COVERED | `materials.json` 已有 |
| best classes for each character | +70% | 0 | COVERED | `/characters/` + `/classes/` 已覆盖 |
| **angelica** | +70% | 0 | **UNVERIFIED** | 2026-10-14 二次 web 核验：官方 Nintendo 页、站点数据文件、web 搜索均未确认 "Angelica" 角色 → 疑似创作者视频误听/自动生成；不写入、不建页，pending |
| yuna mei | +70%/+60% | 1/0 | UNVERIFIED | 既往已判不实（2026-10-07），不建页 |
| wandering wood | +60% | 1 | COVERED | `locations.json` 已有 |
| caladrius | +50% | 0 | VERIFIED-REAL | 既往已核实，落 `locations.json` |
| noctula | +40% | 0 | COVERED | `monsters.json` 已有 |
| monsters in the night | +40% | 0 | COVERED | 既有 sidequest/monster 内容 |
| sand worm meat | +30% | 0 | COVERED | `materials.json` 已有 |
| blacksmith | +30% | 1 | COVERED | `equipment` 体系已覆盖 |
| levin sword | +20% | 1 | COVERED | `weapons.json` 已有 |
| giant meat | +20% | 0 | COVERED | `materials.json` 已有 |
| advanced license | +20% | 0 | COVERED | 既有成长/许可内容 |
| **war arc** | +20% | 0 | **UNVERIFIED** | 无 FW 来源确认 "War Arc" 章节/幕；游戏按 chapter/paralogue 组织，无此命名 → 疑似误听/跨实体；不建页，pending |
| starbirth garden | +20% | 0 | VERIFIED-REAL | 既有 location |
| part 2 | +20% | 2 | WATCH | 续作/DLC 信号，维持观望，不建页 |
| mature blush | +20% | 1 | VERIFIED-REAL | 既有 material 行 |
| dlc | +20% | 1 | WATCH | 维持观望 |
| **paired endings** | +2% | 0 | COVERED | `/supports/` + support-matrix 工具已覆盖 S 支援配对结局 |
| reddit | -2% | 3 | REJECTED | 站外社区导航词（off-entity），粉丝 wiki 不收录外链目录，超出范围 |
| （其余：cullet / paradise fish / the missing granddaughter / spell list / recruitment guide / best class for each character 等） | — | 0–4 | COVERED | 均已在 prior logs 判定覆盖/吸收，本轮无变化 |

**净新建独立页：0。** 这一判定与 2026-08-27 以来的逐周结论一致：本游戏的 long-tail 查询虽多，但绝对量极低且已被现有 30+ 内容目录全覆盖，盲目建页只会产薄页、拖 CWV、无真实流量回报。

---

## 3. 趋势落盘（trend-keywords.json）

- `version` → `2026-10-14`；`source` → 本周窗口。
- `pendingKeywords` 新增 6 条：angelica / war arc（UNVERIFIED）、pepper leaves location / paralogue guide / paired endings（COVERED，注明不重复建页）、reddit（REJECTED）。
- `decisionLog` 追加 `[2026-10-14] Breakout review` 段，记录上述逐项判定。
- `audit-trend-coverage.mjs`：132 关键词全部命中目标文件，exit 0。

---

## 4. 内容编辑（Phase 3）

本周**未新建、未重写**任何内容页。站已成熟，无新的内容缺口信号；breakout 项全部由既有 hub 吸收，无需扩写。

---

## 5. 数据刷新（Phase 2）

console 平台，无 live stats API（区别于 Roblox/Steam）。`update-config.json` 的 `statsRefresh=none`、`statsTarget=""` → 按铁律跳过 scrape-stats，不触碰任何数据文件。本运行未修改 `src/data/*.json`（除趋势追踪表与既有未提交改动外）。

---

## 6. 视频资产（Phase 3.5）

- **3.5a 媒体审计**（每轮硬门禁）：`node scripts/audit-media-integrity.mjs` → exit 0。全站 YouTube embed 标题经 oEmbed 核验一致，无死链/伪造标题，无跨页重复，无缺本地海报。
- **3.5b 视频发现 / 3.5c 字幕转录**：本轮**按范围 defer**。理由：(1) 站已成熟，既有 embed 资产完整且通过 3.5a 门禁；(2) 用户本轮重点明确在 breakout 判定，未要求视频扩量；(3) 全量发现+转录在本机（Windows + yt-dlp NODE_OPTIONS shim）成本高、易波动。本轮**未标 done**（status=`media-audit-only`），不构成伪造完成。
- **待跟进**：若需补充视频资产，建议单独跑一次 3.5b/3.5c（videoIntel.enabled=true 已开启），届时补齐 `.evidence/3.5b-discovery.txt` 与 `3.5c-captions-log.txt` 再标 done。

---

## 7. 竞品建档（Phase 6）

competitor-profiles 维持既有 13 份，本周无新竞品进入视野，未建档（防止把本站当竞品）。

---

## 8. Build 硬门禁（Phase 4）

- `& build.cmd` → EXIT=0。
- 产物：`Compiled successfully`，生成 48 个静态页。
- 挂载审计全绿：媒体完整性、趋势覆盖（132）、browserslist polyfill 清理、范围泄漏审计。
- `❌ Errors: 0 | Warnings: 0`。

---

## 9. 归档与终校验（Phase 7）

- CSV 已归档至 `update-inbox/archive/2026-10-14/`。
- 本报告落盘 `update-inbox/archive/2026-10-14/run-report.md`。
- `.run-state.json` 副本落 `update-inbox/archive/2026-10-14/run-state.json`。
- `verify-run.mjs` 终校验：done phase 均具证据；零孤儿门禁（`audit-orphans.mjs`）通过 → 页面拓扑合法。

### skillIssues / 待跟进
- 仅 3.5b/3.5c 本轮 defer（范围决策，非技能缺陷）。
- 既有未提交改动（gen-content-dates.mjs / pageDates.ts / .indexnow-state.json）来自前次未提交运行，本运行未触碰；如需入版本库请用户另行 commit（gitCommit=false 故未自动提交）。

---

## 10. 结论

本周 Fortune's Weave 趋势无建页价值：所有 breakout 词绝对量极低且被既有内容全覆盖；两个新名字（angelica、war arc）经核验无来源，按零编造政策不写入/不建页。站点以"单语种英文深度"护城河维持，无新增薄页风险。Build 全绿，站点可安全交付。
