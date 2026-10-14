import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

const SITE_URL = process.env.SITE_URL || "https://fortunesweave.online";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "aefdd03c9b771f9ca41d73038ed331aa";
const BING_API_KEY = process.env.BING_API_KEY || "";
const HOST = new URL(SITE_URL).hostname;

const STATE_FILE = path.join(process.cwd(), ".indexnow-state.json");
const SITEMAP_PATH = path.join(process.cwd(), "out", "sitemap.xml");
const LEGACY_CACHE_FILE = path.join(process.cwd(), ".codebuddy", "indexnow", "last-sitemap.xml");

function parseSitemap(xml) {
  const map = {};
  const blocks = xml.split("</url>");
  for (const block of blocks) {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    if (locMatch) {
      const url = locMatch[1].trim();
      const lastmod = lastmodMatch ? lastmodMatch[1].trim() : "";
      map[url] = lastmod;
    }
  }
  return map;
}

function getSitemapXml() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.warn(`⚠️ ${SITEMAP_PATH} not found. Please run \`npm run build\` first.`);
    return null;
  }
  return fs.readFileSync(SITEMAP_PATH, "utf8");
}

function loadBaseline() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    } catch {
      console.warn("⚠️ Corrupted .indexnow-state.json detected, resetting baseline.");
    }
  }
  if (fs.existsSync(LEGACY_CACHE_FILE)) {
    try {
      const legacyXml = fs.readFileSync(LEGACY_CACHE_FILE, "utf8");
      return parseSitemap(legacyXml);
    } catch {}
  }
  return null;
}

function chunkArray(arr, size = 500) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function getChangedUrls(currentMap) {
  const prevMap = loadBaseline();
  if (!prevMap) {
    return { urls: Object.keys(currentMap), deletedUrls: [], firstRun: true };
  }
  const changed = Object.keys(currentMap).filter(
    (u) => !(u in prevMap) || currentMap[u] !== prevMap[u]
  );
  const deleted = Object.keys(prevMap).filter((u) => !(u in currentMap));
  return { urls: changed, deletedUrls: deleted, firstRun: false };
}

function saveBaseline(currentMap) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(currentMap, null, 2), "utf8");
}

function ensureKeyFile() {
  if (!INDEXNOW_KEY || INDEXNOW_KEY === "YOUR_INDEXNOW_KEY") return;
  const keyFileName = `${INDEXNOW_KEY}.txt`;
  const targets = [
    path.join(process.cwd(), "public", keyFileName),
    path.join(process.cwd(), "out", keyFileName),
  ];
  for (const target of targets) {
    const dir = path.dirname(target);
    if (fs.existsSync(dir)) {
      if (!fs.existsSync(target) || fs.readFileSync(target, "utf8").trim() !== INDEXNOW_KEY) {
        fs.writeFileSync(target, INDEXNOW_KEY, "utf8");
        console.log(`🔑 Verified / auto-synced IndexNow key file: ${path.relative(process.cwd(), target)}`);
      }
    }
  }
}

const LIVE_CHECK_CONCURRENCY = 8;

async function checkUrlLive(url) {
  const ua = "Mozilla/5.0 (compatible; IndexNow-AutoSubmitter/1.0; +https://www.indexnow.org)";
  async function probe(method) {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      headers: { "User-Agent": ua },
      signal: AbortSignal.timeout(8000),
    });
    return res.status;
  }
  try {
    let status = await probe("HEAD");
    if (status === 405 || status === 501 || status === 403) {
      try {
        status = await probe("GET");
      } catch {}
    }
    return { url, live: status === 200, status };
  } catch (err) {
    return { url, live: false, status: 0, error: err.message };
  }
}

async function preflightFilter(urls) {
  const live = [];
  const dead = [];
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const current = urls[cursor++];
      const result = await checkUrlLive(current);
      if (result.live) live.push(current);
      else dead.push(result);
    }
  }
  const runners = Array.from({ length: Math.min(LIVE_CHECK_CONCURRENCY, urls.length) }, worker);
  await Promise.all(runners);
  return { live, dead };
}

function postJson(urlStr, data, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const parsed = new URL(urlStr);
    const bodyStr = JSON.stringify(data);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(bodyStr),
        "User-Agent": "IndexNow-AutoSubmitter/1.0",
      },
      timeout: timeoutMs,
    };

    const client = parsed.protocol === "https:" ? https : http;
    const req = client.request(options, (res) => {
      let resData = "";
      res.on("data", (chunk) => (resData += chunk));
      res.on("end", () => resolve({ status: res.statusCode || 0, data: resData }));
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 408, data: "Request Timeout (10s limit exceeded)" });
    });

    req.on("error", (err) => resolve({ status: 0, data: err.message }));
    req.write(bodyStr);
    req.end();
  });
}

async function submitBingApi(urls) {
  if (!BING_API_KEY || BING_API_KEY === "YOUR_BING_WEBMASTER_API_KEY") {
    console.log("ℹ️ BING_API_KEY is not set. Skipping Bing Direct Webmaster API submission.");
    return false;
  }

  const endpoint = `https://www.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}`;
  const batches = chunkArray(urls, 500);
  let allOk = true;

  for (let idx = 0; idx < batches.length; idx++) {
    const batch = batches[idx];
    const prefix = batches.length > 1 ? `[Batch ${idx + 1}/${batches.length}] ` : "";

    async function trySubmit(targetUrls) {
      const payload = { siteUrl: SITE_URL, urlList: targetUrls };
      const res = await postJson(endpoint, payload);
      if (res.status === 200) {
        console.log(`📡 ${prefix}Bing Webmaster API: Submitting ${targetUrls.length} URLs... ✅ SUCCESS (200 OK)`);
        return { success: true, remaining: 0 };
      }

      const match = res.data.match(/Quota remaining for today:\s*(\d+)/i);
      if (match) {
        const remaining = parseInt(match[1], 10);
        return { success: false, remaining };
      }

      console.error(`📡 ${prefix}Bing Webmaster API HTTP Error ${res.status}: ${res.data}`);
      return { success: false, remaining: 0 };
    }

    const result = await trySubmit(batch);
    if (!result.success) {
      if (result.remaining > 0) {
        console.log(`⚠️ ${prefix}Daily quota reached. Auto-retrying with max available ${result.remaining} URLs...`);
        const retryResult = await trySubmit(batch.slice(0, result.remaining));
        if (!retryResult.success) allOk = false;
      } else {
        allOk = false;
      }
    }
  }

  return allOk;
}

async function submitIndexNowEndpoints(urls) {
  if (!INDEXNOW_KEY || INDEXNOW_KEY === "YOUR_INDEXNOW_KEY") {
    console.log("ℹ️ INDEXNOW_KEY is not set. Skipping IndexNow submission.");
    return false;
  }

  ensureKeyFile();

  const endpoints = [
    { name: "IndexNow Global (api.indexnow.org)", url: "https://api.indexnow.org/indexnow" },
    { name: "Bing IndexNow (www.bing.com)", url: "https://www.bing.com/indexnow" },
    { name: "Yandex IndexNow (yandex.com)", url: "https://yandex.com/indexnow" },
  ];

  const batches = chunkArray(urls, 500);
  let successCount = 0;

  for (let idx = 0; idx < batches.length; idx++) {
    const batch = batches[idx];
    const prefix = batches.length > 1 ? `[Batch ${idx + 1}/${batches.length}] ` : "";

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: batch,
    };

    for (const ep of endpoints) {
      const res = await postJson(ep.url, payload);
      if (res.status === 200 || res.status === 202) {
        console.log(`📡 ${prefix}${ep.name}: Submitting ${batch.length} URLs... ✅ SUCCESS (${res.status})`);
        successCount++;
      } else if (res.status === 403 && res.data.includes("UserForbiddedToAccessSite")) {
        console.log(`📡 ${prefix}${ep.name}: Submitting ${batch.length} URLs... Status 403 (Key pending crawl verification)`);
        console.log("   ℹ️ 提示: Bing 初次抓取验证 keyLocation 需后台爬虫访问，数小时内生效属正常现象。");
        console.log("   📊 Bing Webmaster IndexNow 状态: https://www.bing.com/webmasters/indexnow");
      } else {
        console.log(`📡 ${prefix}${ep.name}: Submitting ${batch.length} URLs... Status ${res.status} (${res.data || "No response body"})`);
      }
    }
  }

  return successCount > 0;
}

async function main() {
  console.log(`🚀 Initializing IndexNow & Bing Auto-Submitter (diff mode) for ${SITE_URL}...`);
  const xml = getSitemapXml();
  if (!xml) return;

  const currentMap = parseSitemap(xml);
  const urls = Object.keys(currentMap);
  if (urls.length === 0) {
    console.log("⚠️ No URLs found to submit. Run \`npm run build\` first to export sitemap.");
    return;
  }

  const args = process.argv.slice(2);
  const forceAll = args.includes("--all");

  const { urls: changedUrls, deletedUrls, firstRun } = getChangedUrls(currentMap);
  let targetUrls = [];

  if (forceAll) {
    console.log(`⚠️ --all flag detected: Forcing full submission of all ${urls.length} URLs.`);
    console.log("   🛑 Use --all ONLY for first-time onboarding or a verified recovery re-sync.");
    console.log("   🛑 Repeatedly submitting unchanged URLs is treated as IndexNow abuse and can get your site crawl-throttled.");
    targetUrls = urls;
  } else if (firstRun) {
    console.log(`🌱 First run — no baseline yet. Submitting all ${urls.length} URLs once to bootstrap.`);
    targetUrls = urls;
  } else if (changedUrls.length === 0 && deletedUrls.length === 0) {
    console.log(`⏭️  No content changes since last submission (${urls.length} URLs all unchanged lastmod).`);
    console.log("    Skipping IndexNow/Bing ping to avoid submitting unchanged URLs.");
    console.log("    (Only real content updates — codes/units/guides — bump lastmod.)");
    if (!fs.existsSync(STATE_FILE)) saveBaseline(currentMap);
    return;
  } else {
    targetUrls = Array.from(new Set([...changedUrls, ...deletedUrls]));
    if (changedUrls.length > 0) {
      console.log(`🔎 ${changedUrls.length} URL(s) updated/added since last submission:`);
      changedUrls.slice(0, 10).forEach((u) => console.log(`   - [ADD/MOD] ${u}`));
      if (changedUrls.length > 10) console.log(`   ... and ${changedUrls.length - 10} more`);
    }
    if (deletedUrls.length > 0) {
      console.log(`🗑️  ${deletedUrls.length} URL(s) removed since last submission (notifying search engines to purge):`);
      deletedUrls.slice(0, 10).forEach((u) => console.log(`   - [DELETE] ${u}`));
      if (deletedUrls.length > 10) console.log(`   ... and ${deletedUrls.length - 10} more`);
    }
    console.log("");
  }

  // 🛡️ Live-reachability preflight: never submit URLs that are not yet serving 200
  // on production. Deleted URLs are intentionally gone and are still announced for purge.
  const deletedSet = new Set(deletedUrls);
  const verifyUrls = targetUrls.filter((u) => !deletedSet.has(u));
  console.log(`🔍 Preflight: verifying ${verifyUrls.length} URL(s) are live before submitting (purge-only: ${targetUrls.length - verifyUrls.length})...`);
  const { live, dead } = await preflightFilter(verifyUrls);
  if (dead.length > 0) {
    console.log(`⚠️ ${dead.length} URL(s) not live (HTTP != 200) — skipping to avoid 404 crawl-throttling:`);
    dead.slice(0, 10).forEach((d) => console.log(`   - [DEAD ${d.status || "ERR"}] ${d.url}${d.error ? " (" + d.error + ")" : ""}`));
    if (dead.length > 10) console.log(`   ... and ${dead.length - 10} more`);
  }
  targetUrls = Array.from(new Set([...live, ...deletedUrls]));
  if (targetUrls.length === 0) {
    console.error("❌ Preflight aborted: none of the target URLs are live (site not deployed yet?).");
    console.error("   Baseline NOT updated — deploy first, then re-run.\n");
    process.exitCode = 1;
    return;
  }
  console.log(`✅ Preflight passed: ${live.length} live URL(s) will be submitted.\n`);

  const bingOk = await submitBingApi(targetUrls);
  const indexNowOk = await submitIndexNowEndpoints(targetUrls);

  if (bingOk || indexNowOk) {
    saveBaseline(currentMap);
    console.log("✅ Auto-submission process completed (baseline updated in .indexnow-state.json).\n");
  } else {
    console.error("❌ CRITICAL: All submission endpoints failed. Baseline NOT updated to guarantee retry on next run.\n");
    process.exitCode = 1;
  }
}

main();
