#!/usr/bin/env node
/**
 * verify-gates.mjs - 门禁反向测试（可复跑）
 *
 * 每个 case 必须满足三段式：干净态 exit 0 -> 破坏态 exit 1 -> 复原后 exit 0。
 *
 * 两个环境/设计教训（已内建）：
 *   1. 本机 fs.rmSync 会被 safe-delete 垫片拦掉，force:true 会把错误吞掉而文件仍在 —— 探针清理
 *      一律用 renameSync 挪到 scripts/tmp_yt/removed/，不依赖删除。
 *   2. hero / orphans 这类门禁扫的是源码而不是产物，用「挪走 out/」去测它们必然误判为 FAIL；
 *      触发点必须与实现一致（hero 用裸 h1，language 用数据文件渲染字段里的 CJK）。
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const NL = String.fromCharCode(10);
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const OUT_BAK = path.join(ROOT, "out.__verifybak");
const GRAVEYARD = path.join(ROOT, "scripts", "tmp_yt", "removed");

const run = (command) => {
  const parts = command.split(" ");
  const result = spawnSync(parts[0], parts.slice(1), { cwd: ROOT, encoding: "utf8" });
  return result.status === null ? 1 : result.status;
};

const bury = (file) => {
  fs.mkdirSync(GRAVEYARD, { recursive: true });
  if (fs.existsSync(file)) fs.renameSync(file, path.join(GRAVEYARD, path.basename(file) + "." + Date.now()));
};

const cases = [];
const artifactGate = (name, command) =>
  cases.push({
    name,
    command,
    break: () => {
      if (!fs.existsSync(OUT_DIR)) return false;
      fs.renameSync(OUT_DIR, OUT_BAK);
      return true;
    },
    restore: () => {
      if (fs.existsSync(OUT_BAK)) fs.renameSync(OUT_BAK, OUT_DIR);
    },
  });

artifactGate("audit-site", "node scripts/audit-site.mjs");
artifactGate("audit-seo-meta", "node scripts/audit-seo-meta.mjs");
artifactGate("audit-links", "node scripts/audit-links.mjs");
artifactGate("audit-thin-content", "node scripts/audit-thin-content.mjs");

const probeGate = (name, command, setup, teardown) => cases.push({ name, command, break: setup, restore: teardown });

probeGate("audit-sources", "node scripts/audit-sources.mjs",
  () => {
    fs.writeFileSync(path.join(ROOT, "src", "data", "_probe-sources.json"),
      JSON.stringify({ items: [{ id: "probe", name: "Probe", grade: "official", asOf: "2026-09-28" }] }, null, 2));
    return true;
  },
  () => bury(path.join(ROOT, "src", "data", "_probe-sources.json")));

probeGate("audit-trust-copy", "node scripts/audit-trust-copy.mjs",
  () => {
    fs.writeFileSync(path.join(ROOT, "src", "data", "_probe-trustcopy.json"),
      JSON.stringify({ items: [{ id: "probe", note: "we cannot confirm this because we have not played it", sources: [], grade: "official", asOf: "2026-09-28" }] }, null, 2));
    return true;
  },
  () => bury(path.join(ROOT, "src", "data", "_probe-trustcopy.json")));

probeGate("audit-language", "node scripts/audit-language.mjs",
  () => {
    fs.writeFileSync(path.join(ROOT, "src", "data", "_probe-language.json"),
      JSON.stringify({ items: [{ id: "probe", name: "Gate self test 縦横無尽" }] }, null, 2));
    return true;
  },
  () => bury(path.join(ROOT, "src", "data", "_probe-language.json")));

probeGate("audit-hero", "node scripts/audit-hero.mjs",
  () => {
    const target = path.join(ROOT, "src", "app", "about", "page.tsx");
    fs.writeFileSync(target + ".verifybak", fs.readFileSync(target, "utf8"));
    fs.writeFileSync(target, fs.readFileSync(target, "utf8").replace("<main", "<main>" + NL + "        <h1>Gate self test</h1>"));
    return true;
  },
  () => {
    const target = path.join(ROOT, "src", "app", "about", "page.tsx");
    if (fs.existsSync(target + ".verifybak")) {
      fs.writeFileSync(target, fs.readFileSync(target + ".verifybak", "utf8"));
      bury(target + ".verifybak");
    }
  });

probeGate("audit-orphans", "node scripts/audit-orphans.mjs",
  () => {
    const dir = path.join(ROOT, "src", "app", "gate-self-test");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "page.tsx"),
      ["export default function GateSelfTest() {", "  return <main><p>Gate self test page with no inbound links.</p></main>;", "}", ""].join(NL));
    return true;
  },
  () => {
    const dir = path.join(ROOT, "src", "app", "gate-self-test");
    if (fs.existsSync(dir)) {
      fs.mkdirSync(GRAVEYARD, { recursive: true });
      fs.renameSync(dir, path.join(GRAVEYARD, "gate-self-test." + Date.now()));
    }
  });

probeGate("audit-nav", "node scripts/audit-nav.mjs",
  () => {
    const target = path.join(ROOT, "src", "data", "nav.config.json");
    const original = fs.readFileSync(target, "utf8");
    fs.writeFileSync(target + ".verifybak", original);
    const config = JSON.parse(original);
    config.header.top.push({ label: "Gate self test", href: "/gate-self-test-page-that-does-not-exist/" });
    fs.writeFileSync(target, JSON.stringify(config, null, 2) + NL);
    return true;
  },
  () => {
    const target = path.join(ROOT, "src", "data", "nav.config.json");
    if (fs.existsSync(target + ".verifybak")) {
      fs.writeFileSync(target, fs.readFileSync(target + ".verifybak", "utf8"));
      bury(target + ".verifybak");
    }
  });

probeGate("audit-trend-coverage", "node scripts/audit-trend-coverage.mjs --strict",
  () => {
    const target = path.join(ROOT, "scripts", "trend-keywords.json");
    const original = fs.readFileSync(target, "utf8");
    fs.writeFileSync(target + ".verifybak", original);
    const config = JSON.parse(original);
    config.keywords = (config.keywords || []).concat([{ query: "zzz-gate-self-test-never-on-any-page", target: "src/app/page.tsx", min: 1 }]);
    fs.writeFileSync(target, JSON.stringify(config, null, 2));
    return true;
  },
  () => {
    const target = path.join(ROOT, "scripts", "trend-keywords.json");
    if (fs.existsSync(target + ".verifybak")) {
      fs.writeFileSync(target, fs.readFileSync(target + ".verifybak", "utf8"));
      bury(target + ".verifybak");
    }
  });

const NOT_COVERED = [
  "audit-data / audit-data-drift / audit-media-integrity / audit-updates / audit-header-footer /",
  "  audit-author-eeat / audit-content-integrity / audit-ui-integrity / audit-browserslist-polyfills",
  "Reason: their trigger needs a rebuilt artifact or a deliberately broken page, so a probe would need a full",
  "rebuild between break and restore. They are covered by the production build failing when they fire.",
];

const results = [];
let failures = 0;

for (const item of cases) {
  const cleanExit = run(item.command);
  let brokenExit = null;
  const mutated = item.break();
  if (mutated) brokenExit = run(item.command);
  item.restore();
  const afterExit = run(item.command);
  const pass = cleanExit === 0 && brokenExit === 1 && afterExit === 0;
  if (!pass) failures += 1;
  results.push({ name: item.name, cleanExit, brokenExit, afterExit, pass });
}

console.log(NL + "--- Gate reverse-test sweep ---");
console.log("gate".padEnd(24) + "clean".padEnd(8) + "broken(expect 1)".padEnd(18) + "restored".padEnd(10) + "verdict");
for (const r of results) {
  console.log(
    r.name.padEnd(24) +
      String(r.cleanExit).padEnd(8) +
      String(r.brokenExit === null ? "n/a" : r.brokenExit).padEnd(18) +
      String(r.afterExit).padEnd(10) +
      (r.pass ? "PASS" : "FAIL")
  );
}
console.log(NL + "not covered by this sweep:");
for (const line of NOT_COVERED) console.log("  " + line);

if (failures > 0) {
  console.error(NL + failures + " gate(s) did not behave as expected.");
  process.exit(1);
}
console.log(NL + "OK: " + results.length + " gates each returned 0 clean, 1 when broken, and 0 again after restore.");
