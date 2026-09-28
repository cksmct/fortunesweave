#!/usr/bin/env node
/**
 * audit-sources.mjs - 数据来源门禁（主机独占 / 无解包项目的核心护栏）
 *
 * 立项动机：本类游戏无法数据挖掘，一切数值只能来自游戏内观察与社区来源。
 * 因此「每一行数据都必须能回答三个问题」：来源是谁、来源何时发布、我何时核对过。
 * 缺任何一个就不许上线 —— 这是本站区别于内容农场的唯一硬约束。
 *
 * 规则：
 *   1. src/data/*.json 中的每个「数据行」必须带 sources[] / grade / asOf
 *   2. 行判定：对象含有 id | slug | sources | grade | asOf 之一即视为数据行
 *   3. sources[].url 必须 http(s)，sources[].date 必须 YYYY-MM-DD
 *   4. grade 必须是四枚举之一；grade=cross-checked 时独立来源数必须 >= 2
 *   5. asOf 不得是未来日期（防时区/时钟错乱污染新鲜度信号）
 *   6. 配置文件（game.config.json / nav.config.json / updates.json 等）跳过
 *
 * 反向测试：删掉任意一行的 sources -> 必须 exit 1；复原 -> exit 0。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "data");
const SKIP_FILES = new Set([
  "game.config.json",
  "nav.config.json",
  "updates.json",
  "sources.json",
  "trend-keywords.json"
]);
const GRADES = new Set(["official", "cross-checked", "source-reported", "community-reported"]);
const ROW_KEYS = ["id", "slug", "sources", "grade", "asOf"];

const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function collectRows(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) collectRows(item, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const keys = Object.keys(node).filter((k) => !k.startsWith("_"));
  if (ROW_KEYS.some((k) => keys.includes(k))) {
    out.push(node);
    return;
  }
  for (const key of keys) collectRows(node[key], out);
}

const today = new Date().toISOString().slice(0, 10);
const files = walk(DATA_DIR).filter((f) => !SKIP_FILES.has(path.basename(f)));
let rowCount = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(rel + ": JSON 解析失败 - " + error.message);
    continue;
  }
  const rows = [];
  collectRows(parsed, rows);
  rows.forEach((row, index) => {
    rowCount += 1;
    const id = row.id || row.slug || row.name || "#" + (index + 1);
    const where = rel + " [" + id + "]";
    const sources = Array.isArray(row.sources) ? row.sources : [];
    if (sources.length === 0) {
      failures.push(where + ": 缺少 sources[]（无来源的数据行禁止上线）");
    } else {
      sources.forEach((source, si) => {
        if (!source || typeof source !== "object") {
          failures.push(where + ": sources[" + si + "] 不是对象");
          return;
        }
        if (!/^https?:\/\//.test(String(source.url || ""))) {
          failures.push(where + ": sources[" + si + "].url 非 http(s)");
        }
        if (!isIsoDate(source.date)) {
          failures.push(where + ": sources[" + si + "].date 必须是 YYYY-MM-DD");
        }
      });
    }
    if (!GRADES.has(row.grade)) {
      failures.push(where + ": grade 非法或缺失（" + String(row.grade) + "）");
    }
    if (!isIsoDate(row.asOf)) {
      failures.push(where + ": asOf 缺失或格式错误");
    } else if (row.asOf > today) {
      failures.push(where + ": asOf 是未来日期（" + row.asOf + "）");
    }
    if (row.grade === "cross-checked") {
      const distinct = new Set(sources.map((s) => (s && s.label) || "").filter(Boolean));
      if (distinct.size < 2) {
        failures.push(where + ": grade=cross-checked 但独立来源数 < 2");
      }
    }
  });
}

console.log("audit-sources: 扫描数据文件 " + files.length + " 个 / 数据行 " + rowCount + " 条");
if (failures.length > 0) {
  console.error("数据来源门禁失败 (" + failures.length + "):");
  for (const failure of failures) console.error("  - " + failure);
  process.exit(1);
}
console.log("OK 所有数据行均带 来源 / 分级 / 核对日期");
