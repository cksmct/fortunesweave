#!/usr/bin/env python3
"""IndexNow / Bing URL submission — DIFF MODE.
Hardened with timeout defense, resilient XML parsing, chunking, and conditional baseline saving.
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error
from urllib.parse import urlparse

# Defend against Windows console GBK UnicodeEncodeError on emojis
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

SITE_URL = os.environ.get("SITE_URL", "https://fortunesweave.online")
INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "aefdd03c9b771f9ca41d73038ed331aa")
BING_API_KEY = os.environ.get("BING_API_KEY", "")
HOST = urlparse(SITE_URL).hostname or "fortunesweave.online"

STATE_FILE = os.path.join(os.getcwd(), ".indexnow-state.json")
LEGACY_CACHE_FILE = os.path.join(os.getcwd(), ".codebuddy", "indexnow", "last-sitemap.xml")
SITEMAP_PATH = os.path.join(os.getcwd(), "out", "sitemap.xml")


def load_env():
    env_path = os.path.join(os.getcwd(), ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                match = re.match(r"^\s*([\w.-]+)\s*=\s*(.*)?\s*$", line)
                if match:
                    k, v = match.group(1), match.group(2) or ""
                    if v.startswith('"') and v.endswith('"'):
                        v = v[1:-1]
                    if k not in os.environ:
                        os.environ[k] = v.strip()


def parse_sitemap(content):
    """Return { url: lastmod } map from sitemap.xml.
    Robust against missing <lastmod> tags.
    """
    items = {}
    for block in content.split("</url>"):
        loc_match = re.search(r"<loc>([^<]+)</loc>", block)
        lastmod_match = re.search(r"<lastmod>([^<]+)</lastmod>", block)
        if loc_match:
            url = loc_match.group(1).strip()
            lastmod = lastmod_match.group(1).strip() if lastmod_match else ""
            items[url] = lastmod
    return items


def get_sitemap_map():
    if not os.path.exists(SITEMAP_PATH):
        print(f"⚠️ {SITEMAP_PATH} not found. Please run `npm run build` first.")
        return None
    with open(SITEMAP_PATH, "r", encoding="utf-8") as f:
        return parse_sitemap(f.read())


def load_baseline():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            print("⚠️ Corrupted .indexnow-state.json detected, resetting baseline.")
    if os.path.exists(LEGACY_CACHE_FILE):
        try:
            with open(LEGACY_CACHE_FILE, "r", encoding="utf-8") as f:
                return parse_sitemap(f.read())
        except Exception:
            pass
    return None


def chunk_list(lst, size=500):
    return [lst[i:i + size] for i in range(0, len(lst), size)]


def get_changed_urls(current):
    prev = load_baseline()
    if prev is None:
        return list(current.keys()), [], True
    changed = [u for u in current if u not in prev or current[u] != prev[u]]
    deleted = [u for u in prev if u not in current]
    return changed, deleted, False


def save_baseline(current):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(current, f, indent=2, ensure_ascii=False)


def post_json(url, data, timeout=10):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "IndexNow-AutoSubmitter/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.getcode(), resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")
    except urllib.error.URLError as e:
        return 408 if "timed out" in str(e).lower() else 0, str(e)
    except Exception as e:
        return 0, str(e)


def submit_indexnow(urls):
    if not INDEXNOW_KEY or INDEXNOW_KEY == "YOUR_INDEXNOW_KEY":
        print("ℹ️ INDEXNOW_KEY is not set. Skipping IndexNow submission.")
        return False

    endpoints = [
        ("IndexNow Global (api.indexnow.org)", "https://api.indexnow.org/indexnow"),
        ("Bing IndexNow (www.bing.com)", "https://www.bing.com/indexnow"),
        ("Yandex IndexNow (yandex.com)", "https://yandex.com/indexnow"),
    ]
    batches = chunk_list(urls, 500) if urls else []
    success_count = 0

    for batch_idx, batch in enumerate(batches, 1):
        prefix = f"[Batch {batch_idx}/{len(batches)}] " if len(batches) > 1 else ""
        payload = {
            "host": HOST,
            "key": INDEXNOW_KEY,
            "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
            "urlList": batch,
        }
        for name, ep in endpoints:
            code, resp = post_json(ep, payload)
            if code in (200, 202):
                print(f"📡 {prefix}{name}: Submitting {len(batch)} URLs... ✅ SUCCESS ({code})")
                success_count += 1
            elif code == 403 and "UserForbiddedToAccessSite" in resp:
                print(f"📡 {prefix}{name}: Submitting {len(batch)} URLs... Status 403 (Key pending crawl verification)")
                print("   ℹ️ 提示: Bing 初次抓取验证 keyLocation 需后台爬虫访问，数小时内生效属正常现象。")
                print("   📊 Bing Webmaster IndexNow 状态: https://www.bing.com/webmasters/indexnow")
            else:
                print(f"📡 {prefix}{name}: Submitting {len(batch)} URLs... Status {code} ({resp[:100] if resp else 'No body'})")

    return success_count > 0


def submit_bing_api(urls):
    if not BING_API_KEY or BING_API_KEY == "YOUR_BING_WEBMASTER_API_KEY":
        print("ℹ️ BING_API_KEY is not set. Skipping Bing Direct Webmaster API submission.")
        return False

    endpoint = f"https://www.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey={BING_API_KEY}"
    batches = chunk_list(urls, 500) if urls else []
    all_ok = True

    for batch_idx, batch in enumerate(batches, 1):
        prefix = f"[Batch {batch_idx}/{len(batches)}] " if len(batches) > 1 else ""

        def try_submit(target_urls):
            payload = {"siteUrl": SITE_URL, "urlList": target_urls}
            code, resp = post_json(endpoint, payload)
            if code == 200:
                print(f"📡 {prefix}Bing Webmaster API: Submitting {len(target_urls)} URLs... ✅ SUCCESS (200 OK)")
                return True, 0
            match = re.search(r"Quota remaining for today:\s*(\d+)", resp, re.I)
            if match:
                return False, int(match.group(1))
            print(f"📡 {prefix}Bing Webmaster API HTTP Error {code}: {resp}")
            return False, 0

        ok, rem = try_submit(batch)
        if not ok:
            if rem > 0:
                print(f"⚠️ {prefix}Daily quota reached. Auto-retrying with max available {rem} URLs...")
                retry_ok, _ = try_submit(batch[:rem])
                if not retry_ok:
                    all_ok = False
            else:
                all_ok = False

    return all_ok


def main():
    load_env()
    print(f"🚀 Initializing IndexNow & Bing Auto-Submitter (diff mode) for {SITE_URL}...")
    current_map = get_sitemap_map()
    if not current_map:
        return

    urls = list(current_map.keys())
    if not urls:
        print("⚠️ No URLs found to submit. Run `npm run build` first to export sitemap.")
        return

    force_all = "--all" in sys.argv[1:]
    changed_urls, deleted_urls, first_run = get_changed_urls(current_map)

    if force_all:
        print(f"⚠️ --all flag detected: Forcing full submission of all {len(urls)} URLs.")
        target_urls = urls
    elif first_run:
        print(f"🌱 First run — no baseline yet. Submitting all {len(urls)} URLs once to bootstrap.")
        target_urls = urls
    elif not changed_urls and not deleted_urls:
        print(f"⏭️  No content changes since last submission ({len(urls)} URLs all unchanged lastmod).")
        print("    Skipping IndexNow/Bing ping to avoid submitting unchanged URLs.")
        print("    (Only real content updates — codes/units/guides — bump lastmod.)")
        if not os.path.exists(STATE_FILE):
            save_baseline(current_map)
        return
    else:
        target_urls = list(dict.fromkeys(changed_urls + deleted_urls))
        if changed_urls:
            print(f"🔎 {len(changed_urls)} URL(s) updated/added since last submission:")
            for u in changed_urls[:10]:
                print(f"   - [ADD/MOD] {u}")
            if len(changed_urls) > 10:
                print(f"   ... and {len(changed_urls) - 10} more")
        if deleted_urls:
            print(f"🗑️  {len(deleted_urls)} URL(s) removed since last submission (notifying search engines to purge):")
            for u in deleted_urls[:10]:
                print(f"   - [DELETE] {u}")
            if len(deleted_urls) > 10:
                print(f"   ... and {len(deleted_urls) - 10} more")
        print("")

    bing_ok = submit_bing_api(target_urls)
    indexnow_ok = submit_indexnow(target_urls)

    # 🛡️ CRITICAL DEFENSE: Only update persistent baseline if at least one submission endpoint succeeded!
    if bing_ok or indexnow_ok:
        save_baseline(current_map)
        print("✅ Auto-submission process completed (baseline updated in .indexnow-state.json).\n")
    else:
        print("❌ CRITICAL: All submission endpoints failed. Baseline NOT updated to guarantee retry on next run.\n", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
