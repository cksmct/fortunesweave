#!/usr/bin/env python3
"""IndexNow / Bing URL submission — DIFF MODE.
Hardened with timeout defense, resilient XML parsing, chunking, and conditional baseline saving.
"""
import concurrent.futures
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
INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "7817473e3732e3c236378e2d4c0bcdc4")
BING_API_KEY = os.environ.get("BING_API_KEY", "")
HOST = urlparse(SITE_URL).hostname or "your-domain.com"

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


def ensure_key_file():
    """Key File Auto-Integrity: ensures public/{KEY}.txt and out/{KEY}.txt exist and
    match INDEXNOW_KEY, preventing Bing 403 UserForbiddedToAccessSite rejections."""
    if not INDEXNOW_KEY or INDEXNOW_KEY == "YOUR_INDEXNOW_KEY":
        return
    key_filename = f"{INDEXNOW_KEY}.txt"
    targets = [
        os.path.join(os.getcwd(), "public", key_filename),
        os.path.join(os.getcwd(), "out", key_filename),
    ]
    for target in targets:
        pdir = os.path.dirname(target)
        if os.path.exists(pdir):
            if not os.path.exists(target) or open(target, "r", encoding="utf-8").read().strip() != INDEXNOW_KEY:
                with open(target, "w", encoding="utf-8") as f:
                    f.write(INDEXNOW_KEY)
                print(f"🔑 Verified / auto-synced IndexNow key file: {os.path.relpath(target, os.getcwd())}")


LIVE_CHECK_CONCURRENCY = 8


def check_url_live(url, timeout=8):
    """Return (is_live, status). Only a production URL already serving 200 is safe to
    submit; submitting undeployed URLs makes Bing crawl 404s and crawl-throttles the
    whole site. HEAD first, fall back to GET when the host rejects HEAD."""
    ua = "Mozilla/5.0 (compatible; IndexNow-AutoSubmitter/1.0; +https://www.indexnow.org)"

    def probe(method):
        req = urllib.request.Request(url, method=method, headers={"User-Agent": ua})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.getcode()
        except urllib.error.HTTPError as e:
            return e.code
        except Exception:
            return 0

    status = probe("HEAD")
    if status in (403, 405, 501):
        status = probe("GET")
    return status == 200, status


def preflight_filter(urls):
    """Bounded-concurrency live-reachability preflight. Returns (live, dead)."""
    live, dead = [], []
    if not urls:
        return live, dead
    with concurrent.futures.ThreadPoolExecutor(max_workers=LIVE_CHECK_CONCURRENCY) as executor:
        futures = {executor.submit(check_url_live, u): u for u in urls}
        for future in concurrent.futures.as_completed(futures):
            u = futures[future]
            try:
                ok, status = future.result()
            except Exception:
                ok, status = False, 0
            if ok:
                live.append(u)
            else:
                dead.append((u, status))
    return live, dead


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

    ensure_key_file()

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
            m = re.search(r"Quota remaining for today:\s*(\d+)", resp, re.I)
            if m:
                return False, int(m.group(1))
            print(f"📡 {prefix}Bing Webmaster API HTTP Error {code}: {resp[:200]}")
            return False, 0

        ok, rem = try_submit(batch)
        if ok:
            continue
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
    current = get_sitemap_map()
    if current is None:
        print("⚠️ No sitemap found.")
        return
    urls = list(current.keys())
    if not urls:
        print("⚠️ No URLs found in out/sitemap.xml.")
        return

    force_all = "--all" in sys.argv
    changed, deleted, first_run = get_changed_urls(current)

    if force_all:
        print(f"⚠️ --all flag detected: Forcing full submission of all {len(urls)} URLs.")
        print("   🛑 Use --all ONLY for first-time onboarding or a verified recovery re-sync.")
        print("   🛑 Repeatedly submitting unchanged URLs is treated as IndexNow abuse and can get your site crawl-throttled.")
        target_urls = urls
    elif first_run:
        print(f"🌱 First run — no baseline yet. Submitting all {len(urls)} URLs once to bootstrap.")
        target_urls = urls
    elif not changed and not deleted:
        print(f"⏭️  No content changes since last submission ({len(urls)} URLs all unchanged lastmod).")
        print("    Skipping IndexNow/Bing ping to avoid submitting unchanged URLs.")
        if not os.path.exists(STATE_FILE):
            save_baseline(current)
        return
    else:
        target_urls = list(dict.fromkeys(changed + deleted))
        if changed:
            print(f"🔎 {len(changed)} URL(s) updated/added since last submission:")
            for u in changed[:10]:
                print(f"   - [ADD/MOD] {u}")
            if len(changed) > 10:
                print(f"   ... and {len(changed) - 10} more")
        if deleted:
            print(f"🗑️  {len(deleted)} URL(s) removed since last submission (notifying search engines to purge):")
            for u in deleted[:10]:
                print(f"   - [DELETE] {u}")
            if len(deleted) > 10:
                print(f"   ... and {len(deleted) - 10} more")
        print()

    # 🛡️ Live-reachability preflight: never submit URLs that are not yet serving 200
    # on production. Deleted URLs are intentionally gone and are still announced for purge.
    deleted_set = set(deleted)
    verify_urls = [u for u in target_urls if u not in deleted_set]
    print(f"🔍 Preflight: verifying {len(verify_urls)} URL(s) are live before submitting (purge-only: {len(target_urls) - len(verify_urls)})...")
    live_urls, dead_urls = preflight_filter(verify_urls)
    if dead_urls:
        print(f"⚠️ {len(dead_urls)} URL(s) not live (HTTP != 200) — skipping to avoid 404 crawl-throttling:")
        for u, status in dead_urls[:10]:
            print(f"   - [DEAD {status or 'ERR'}] {u}")
        if len(dead_urls) > 10:
            print(f"   ... and {len(dead_urls) - 10} more")
    target_urls = list(dict.fromkeys(live_urls + deleted))
    if not target_urls:
        print("❌ Preflight aborted: none of the target URLs are live (site not deployed yet?).", file=sys.stderr)
        print("   Baseline NOT updated — deploy first, then re-run.\n", file=sys.stderr)
        sys.exit(1)
    print(f"✅ Preflight passed: {len(live_urls)} live URL(s) will be submitted.\n")

    bing_ok = submit_bing_api(target_urls)
    indexnow_ok = submit_indexnow(target_urls)

    if bing_ok or indexnow_ok:
        save_baseline(current)
        print("✅ IndexNow submission finished (baseline updated in .indexnow-state.json).\n")
    else:
        print("❌ CRITICAL: All submission endpoints failed. Baseline NOT updated to guarantee retry.\n", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
