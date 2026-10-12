# Fortune's Weave 站点更新报告 · 2026-10-12

## 1. 运行概况
- **技能**：one-click-site-update
- **本站域名**：fortunesweave.online（Fire Emblem: Fortune's Weave 粉丝攻略站，单语英文）
- **平台**：console（Switch 2 独占，无 live stats 端点、无虚拟事件 API）
- **Trends 来源**：用户手动放入 `update-inbox/` 的两份 Google Trends CSV（窗口 2026-10-05 ~ 2026-10-12，恰为今日，距今天数 0），按「手动契约」直接进入 Phase 1，**未调用抓取脚本**（避免清掉已提供文件）。批次门禁 `inbox-batch-check.mjs` 退出码 0，单批次、无过期。
- **构建**：`build.cmd`（静态导出）退出码 0，全部后构建审计绿灯（媒体真实存在+跨页去重、趋势覆盖、browserslist、scope leak、partners guard）。
- **提交/推送/IndexNow**：`gitCommit`/`gitPush` 为 false，`indexnow` 为 true；因本轮不提交/不部署，IndexNow 通知无已上线 URL 可通知，故跳过（仅记录当前 HEAD = `131a62166972d68bddb083f461375d128a754012`）。

## 2. Breakout 项专项评估（用户重点关注）
本轮 rising CSV 的 Breakout / 高增长项逐条判定（重点：是否值得建新页）：

| 查询 | 增长 | 判定 | 理由 |
|---|---|---|---|
| `geitz fire emblem` | 160% | **拒绝** | FE7（烈火之剑）角色，跨游戏非本站实体 |
| `pepper leaves location` | 150% | 已覆盖 | 材料 `Pepper Leaves` 已在 materials.json |
| `wonder leaf` | 110% | 已覆盖 | materials.json |
| `monsters in the night` | 110% | 已覆盖 | 支线 `Monster in the Night` 已在 sidequests.json |
| **`kothar gar`** | **100%** | **真实缺口→已修** | 联网核验为**真实材料**（fish/item，位于 Alcineus Span, Amalthea，左邻 Dagsion；Game8 + Fextralife 双源佐证）。**此前缺失于 materials.json**，本轮已补一条带来源的最小行（stats/effects 待转录）。**非页面缺口**，归 /materials |
| `mature blush` | 70% | 已覆盖/吸收 | 站娘任务交付物，已吸收 |
| `monster in the night`（变体） | 70% | 已覆盖 | 同上 |
| `desert map` | 60% | 已覆盖/吸收 | 联网核验为 **Nysiades Desert**（RPG Site / fortunesweave.co.uk 确认），region 已在 locations.json，归 /locations + /map |
| **`collector's edition`** | 60% | 已验证-真实/不建页 | 真实商品（$120 Dagdan Collection Edition，GameSpot 确认）；商业/产品意图，interest≈0，低于 B 档新页门槛，归 /about |
| `paradise fish` | 60% | 已覆盖 | materials.json |
| `spell list` | 50% | 已覆盖 | 已吸收进武器/法术表 |
| `uncharted isle` | 50% | 已覆盖 | locations.json |
| **`yuna mei`** | 40% | **未核实** | 联网复核无任一 Fortune's Weave 来源确认该角色（疑似误听/机器生成）；零编造政策下不建内容，维持 pending |
| `sand worm meat` | 40% | 已覆盖 | materials.json |
| `cullet` | 30% | 已覆盖 | materials.json |
| `fe fortune's weave paralogues` | 30% | 已覆盖 | paralogues |
| `starbirth garden` | 30% | 已覆盖 | 支线 location / materials |
| `recruitment guide`（×2） | 30% | 已覆盖 | characters 页承接 |
| `dlc` | 30% | 观望/模糊 | 无 DLC 官宣，不建页 |
| **`caladrius`** | 20% | 已覆盖/吸收 | 联网核验为**高级骑兵职业**（Advanced Cavalry class），已在 classes.json |
| `noctula` | 20% | 已覆盖 | 真实角色，已在 characters.json |
| `advanced license` | 20% | 已覆盖 | classes 页 |
| `lind` | 20% | 已覆盖 | characters.json |
| `blacksmith`（×2） | 20% | 已覆盖 | classes/blacksmith |
| `shop deals on ... game` | 20% | **拒绝** | 商业购游查询，非内容 |
| `best class for each character` | 20% | 已覆盖 | /classes + /tools/class-planner 承接 |
| **`lost temple cat`** | 10% | 已覆盖/吸收 | 联网核验为 Cai 善意支线任务，已在 sidequests.json |
| `part 2` | 10% | 观望/模糊 | 无续作官宣 |
| `legacy of a legendary sculptor` | 9% | 已覆盖 | 已有独立页 |
| `anatolia` | 10% | 已覆盖 | 真实角色 characters.json |
| `serenes forest` | 10% | **拒绝** | 第三方 wiki 站点，非实体 |
| 其余（glirmosa / levin sword / giants meat / mu / best class / wonder leaves / tier list / reddit / wiki / tv tropes / fire emblem (系列) / switch 2 / three houses 等） | — | 已覆盖/拒绝 | 同前序日志归类 |

**结论（用户关注的 breakout 命题）**：本轮 breakout / 高增长项**没有任何一项值得新建独立页面**。四类"看似新实体"的名字（Kothar Gar / Caladrius / Lost Temple Cat / Nysiades Desert）经联网核验后均为**已有分类的真实实体**（材料 / 职业 / 支线 / 区域），且已存在于数据或 hub 中，不构成页面缺口；唯一真实数据缺口 **Kothar Gar** 已作为材料行补入 `materials.json`（属数据富集，非新 URL）。不建新页的三重依据：(1) 绝对搜索量近零（相对 0–100 量表中 0–1），预期增量远低于 20/月价值门槛；(2) 全部 breakout 项均已解析到现有 hub/独立页；(3) 唯一缺失真实实体是材料行而非页面。

`trend-keywords.json` 升至版本 **2026-10-12**（共 132 词，全部命中目标页，趋势覆盖审计绿灯）；本轮新增 4 条强制覆盖行（caladrius→classes.json、lost temple cat→sidequests.json、nysiades→locations.json、kothar gar→materials.json），并将 `collector's edition`/`desert map` 由 GAP/UNVERIFIED 更新为 VERIFIED-REAL、`yuna mei` 更新为 UNVERIFIED；decisionLog 追加本轮 breakout 复审记录。

## 3. 集成与门禁（Phase 1 产出）
- 真实内容变更：仅 `src/data/materials.json` 新增 1 行（Kothar Gar，带 Game8 + Fextralife 来源），`_comment` 计数同步更新（23→24 行 / 5→6 类）。
- 构建全审计绿灯，确认数据改动未破坏任何数据驱动页面（materials 页动态渲染 category，无类型破坏）。

## 4. 未执行 / 轻量执行项（诚实记录）
- **Phase 1.5 Event Watch**：console 平台无虚拟事件 API，`events.autoDetect=false`，跳过。
- **Phase 2 数据刷新**：console 无 live stats 端点，`statsRefresh=none`、`statsTarget=''`，按设计 no-op（非伪造 done）。
- **Phase 3 竞品研究（轻量）**：竞品 KB（`_summary.md`，2026-09-30）仅 13 天前，且目录显示本站此后已补齐 mounts/factions/meals/battalions/talents/crests/deities/postgame 等曾被列为缺口的栏目。本轮未触发全新高价值、且通过价值门槛的独立页；KB 中"待办缺口"（逐角色招募页等）单条搜索量均低于 20/月门槛，维持不建页。未重新抓取全量竞品（与 09-30 间隔过短、增量有限）。
- **Phase 3.5 视频（轻量）**：`videoIntel.enabled=true`，yt-dlp（v2026.07.04）可用，确认指南类内容活跃；但 beginner/class guide 高价值视频**已被嵌入**（grep 命中 classes/page.tsx、systems/page.tsx、gameplay/page.tsx、classes.json 等 6 处），且本轮 breakout 项均为近零兴趣的物品/角色查询（非视频向）。现有嵌入已在构建媒体审计中通过"真实存在 + 跨页无重复"校验。本轮**未新增嵌入视频**。
- **Phase 5 提交/推送/IndexNow**：开关 false/true；因不部署，IndexNow 跳过（无已上线 URL）。

## 5. 技能自修补收集（Phase 6）
1. **`verify-run.mjs` 本项目缺失**：技能 Phase 7 终校验依赖该脚本，但 `fortunesweave` 项目未提供（search 0 命中）。本轮改用等价手动校验（CSV 已归档、报告+state 已落盘）。→ 建议技能在仓库脚手架中内置 `verify-run.mjs`。
2. **`fetch-trends.mjs` 会清空用户已放入 inbox 的 CSV**：本轮按"手动契约"未调用抓取，但脚本设计会在 fetch 后删除旧 CSV——若用户手动放档后又触发 fetch，输入会丢失。→ 技能应区分"用户手动档"与"脚本抓取档"，或 fetch 前备份。
3. **`google-trends-to-pages` 应先核验实体类型再判缺口**：本轮回看的四类"新候选"初判似角色缺口，实则为 materials/classes/sidequests/locations 已有分类实体。→ 技能 SOP 应加入"先用 web 核验实体真实类型与所属数据文件，再判页面缺口"，避免把已覆盖实体误报为 gap。
4. **Phase 3.5 假设 `videos.json`，但本项目内联视频**：本站无 `videos.json`，视频以 `YouTubeEmbed` 内联在各页 `page.tsx`/数据文件。→ 技能 KB 应注明视频存储形态多样，发现/嵌入前先探测存储位置。

## 6. 归档（Phase 7）
- 两份输入 CSV 已移至 `update-inbox/archive/2026-10-12/`。
- 本报告与 `.run-state.json` 落盘于 `update-inbox/`，副本存于 `archive/2026-10-12/`。
- 构建日志 `build_run.log` 已清理。

> 注：`verify-run.mjs` 缺失，故未跑脚本终校验；以上归档/落盘已手动确认完成。
