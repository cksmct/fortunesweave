# Fortune's Weave 站点更新报告 · 2026-10-03

## 1. 运行概况
- **技能**：one-click-site-update
- **本站域名**：fortunesweave.online（Fire Emblem: Fortune's Weave 粉丝攻略站，单语英文）
- **平台**：console（Switch 2 独占，无 live stats 端点、无虚拟事件 API）
- **Trends 来源**：用户手动放入 `update-inbox/` 的两份 Google Trends CSV（窗口 2026-10-02 ~ 2026-10-03），按「手动契约」直接进入 Phase 1，未调用抓取脚本（避免清掉已提供文件）
- **构建**：`npm run build` 退出码 0，全部后构建审计绿灯
- **提交/推送/IndexNow**：`gitCommit`/`gitPush`/`indexnow` 均为 false，仅记录当前 HEAD = `9a516d668a0567b96cf028d5864c7d5fe2818f04`

## 2. Breakout 项专项评估（用户重点关注）
本轮 rising CSV 的 Breakout（interest=0、增长标记为 Breakout）项逐条判定：

| 查询 | 判定 | 理由 |
|---|---|---|
| `fire emblem fortune's weave gameplay` | **新建页面** | 实体匹配、站内无「玩法总览」式整页；基于已有核实机制（Free Time / Main Battle / Clash / Blaze Arts / 认证考试）撰写，无臆造 |
| `switch 2 emulator` | **拒绝** | 非本站实体：查询指向 Switch 2 模拟器/盗版，不在本站范围 |
| `fire emblem fortune's weave best classes for each character` | 维持 pending | 不建独立页，由 `/tools/class-planner` + `/classes` 承接 |
| `fire emblem fortune's weave new game plus` | 已覆盖 | `/postgame/` 已含 Descend Again / New Game Plus 说明 |

**结论**：4 个 Breakout 中仅有 **gameplay** 值得且已新建独立页；其余 3 个分别拒绝/已覆盖/不建页。

## 3. 本轮其它趋势词处理
- **新建页面**：1 个 → `/gameplay/`（Free Time 与 Main Battle 循环、战术战斗 vs Clash、Blaze Arts、职业认证、新手建议；内容全部源自站内已核实数据）
- **GENUINE GAP（缺口，待信源核实后再建）**：`collector's edition`（160%，无核实的盒子内容与定价）、`yuna mei`（150%，角色库无此条目，需来源核实）
- **C 档吸收（不建页）**：`voice actors`（20%，characters.json 无声优字段，需信源）、`review`（-3%）、`release date`（7%，发布日已在 game.config/home/about）
- **已覆盖（上轮已落地）**：monster in the night / lost temple cat（sidequests）、paired endings（supports）、war arc（walkthrough）、cataphract/blacksmith（classes）、各类材料（materials）、mounts、paralogues、recruitment 等
- **拒绝（非实体）**：`fire emblem awakening`（另一部 FE 作品）、`fire emblem`/`switch 2`/`nintendo`（系列/平台/发行商）

`trend-keywords.json` 已升至版本 2026-10-03（共 82 词，全部命中目标页，趋势覆盖审计绿灯）。

## 4. 集成与门禁
- 新页已注册：`game.config.json#routes`（sitemap 源）+ `nav.config.json`（Header「Reference」组 + Footer「Guides and data」，全站级入链）
- 上下文反链：首页「What it is」段 + `/systems/` 页「Where to start」段
- 孤儿审计：0 孤儿、0 孤岛、全部内容页 ≥2 入链、BFS 深度 ≤2、0 死链
- SEO 元数据：title/description 长度合规；趋势关键词命中
- 媒体完整性：50 个视频实例语义与真实存在性全部通过
- 读者信任/来源/作者 E-E-A-T/语言/UI/数据漂移 等审计全部绿灯

## 5. 未执行项（诚实记录）
- **Phase 1.5 Event Watch**：console 平台无虚拟事件 API，`events.autoDetect=false`，跳过
- **Phase 2 数据刷新**：console 无 live stats 端点，`statsRefresh=none`，跳过
- **Phase 3.5b/c 视频发现/转写**：3.5a 媒体完整性门禁随构建通过；本轮聚焦 breakout 新页，未执行新一轮 yt-dlp 发现与转写，未在新页嵌入新视频（避免无字幕臆造）
- **Phase 5 提交/推送**：开关全 false，仅记录 HEAD

## 6. 归档
- 两份输入 CSV 已移至 `update-inbox/archive/2026-10-03/`
- 本报告与 `.run-state.json` 落盘于 `update-inbox/`，副本存于归档目录
