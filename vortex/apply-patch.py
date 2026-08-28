#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply-patch.py — پچ‌های لازم برای استفاده از Vortex Gateway به‌عنوان پروکسی AI از
داخل اپ‌های مرورگری مثل Leitner-Pro-Max.

پچ ۱: CORS_EXTRA_ORIGINS  — اجازه می‌دهد Origin های دلخواه (مثل GitHub Pages لایتنر)
      به پنل/API/پروکسی دسترسی CORS داشته باشند.
پچ ۲: PROXY_API_TOKEN    — اجازه می‌دهد /api/proxy بدون کوکی سشن، با هدر
      `Authorization: Bearer <token>` یا `X-Vortex-Token: <token>` فراخوانی شود
      (برای PWA روی origin دیگر؛ هدر دوم برای درخواست‌های provider که خودشان
      Authorization دارند، مثل OpenRouter).
پچ ۳: require_auth_csrf  — وقتی احراز با توکن انجام شد، CSRF سشن لازم نیست.

استفاده:
  python apply-patch.py /path/to/vortex-repo [--out-env out.env]
همه پچ‌ها idempotent هستند (اجرای دوباره تغییری ایجاد نمی‌کند).
"""
import argparse
import io
import os
import re
import secrets
import sys

PATCHES = [
    # پچ ۰: ارتقا — فایل‌هایی که با نسخه قبلی پچ شدند → نسخه با X-Vortex-Token
    (
        '''    api_token = os.environ.get("PROXY_API_TOKEN", "").strip()
    auth = request.headers.get("authorization", "")
    if api_token and auth.lower().startswith("bearer ") and hmac.compare_digest(auth[7:].strip(), api_token):
        return None  # توکن معتبر: CSRF کوکی‌ای معنی ندارد
    raise HTTPException(status_code=401, detail="unauthorized")''',
        '''    api_token = os.environ.get("PROXY_API_TOKEN", "").strip()
    if not api_token:
        raise HTTPException(status_code=401, detail="unauthorized")
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer ") and hmac.compare_digest(auth[7:].strip(), api_token):
        return None  # توکن معتبر: CSRF کوکی‌ای معنی ندارد
    xt = request.headers.get("x-vortex-token", "")
    if xt and hmac.compare_digest(xt.strip(), api_token):
        return None  # برای درخواست‌های provider که خودشان Authorization دارند
    raise HTTPException(status_code=401, detail="unauthorized")''',
        'X-Vortex-Token upgrade',
    ),
    # پچ ۱ — CORS_EXTRA_ORIGINS
    (
        'allowed = {get_public_origin(), "http://localhost:8000"}',
        '''allowed = {get_public_origin(), "http://localhost:8000"} | {
        o.strip().lower() for o in os.environ.get("CORS_EXTRA_ORIGINS", "").split(",") if o.strip()
    }''',
        'CORS_EXTRA_ORIGINS',
    ),
    # پچ ۲ — احراز هویت /api/proxy با توکن (Authorization: Bearer یا X-Vortex-Token)
    (
        '''async def require_auth(request: Request):
    token = request.cookies.get(SESSION_COOKIE)
    if not await is_valid_session(token):
        raise HTTPException(status_code=401, detail="unauthorized")
    return token''',
        '''async def require_auth(request: Request):
    token = request.cookies.get(SESSION_COOKIE)
    if await is_valid_session(token):
        return token
    # دسترسی پروکسی با توکن: برای کلاینت‌های خارج از origin (مثل PWA لایتنر).
    api_token = os.environ.get("PROXY_API_TOKEN", "").strip()
    if not api_token:
        raise HTTPException(status_code=401, detail="unauthorized")
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer ") and hmac.compare_digest(auth[7:].strip(), api_token):
        return None  # توکن معتبر: CSRF کوکی‌ای معنی ندارد
    xt = request.headers.get("x-vortex-token", "")
    if xt and hmac.compare_digest(xt.strip(), api_token):
        return None  # برای درخواست‌های provider که خودشان Authorization دارند
    raise HTTPException(status_code=401, detail="unauthorized")''',
        'PROXY_API_TOKEN',
    ),
    # پچ ۳ — require_auth_csrf: وقتی احراز با توکن شد، CSRF لازم نیست
    (
        '''    token = request.cookies.get(SESSION_COOKIE)
    if not await is_valid_session(token):
        raise HTTPException(status_code=401, detail="unauthorized")
    expected = csrf_token_for_session(token)''',
        '''    token = await require_auth(request)
    if token is None:
        return None  # احراز با توکن انجام شده — CSRF سشن لازم نیست
    expected = csrf_token_for_session(token)''',
        None,
    ),
]

AI_ALLOWLIST = (
    "generativelanguage.googleapis.com,"      # Gemini
    "api.openrouter.ai,"                      # OpenRouter
    "api.groq.com,"                           # Groq
    "image.pollinations.ai,gen.pollinations.ai,text.pollinations.ai,enter.pollinations.ai,"  # Pollinations
    "api.dictionaryapi.dev,"                  # دیکشنری VocabForge
    "api.mymemory.translated.net,"            # ترجمه فارسی
    "en.wiktionary.org,"                      # ریشه‌شناسی / Word Web
    "api.datamuse.com,"                       # مترادف
    ""  # Public CORS proxies are intentionally excluded; fail closed by default.
)

DEFAULT_ORIGINS = (
    "https://mohsen-niksirat.github.io,"
    "http://localhost:5173,"
    "http://127.0.0.1:8794,"
    "http://localhost:8000"
)


def apply(repo_dir: str) -> list:
    path = os.path.join(repo_dir, "main.py")
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    applied = []
    for old, new, _name in PATCHES:
        if new in s:
            applied.append(("skip", old[:60]))
            continue
        n = s.count(old)
        if n == 0:
            applied.append(("skip", old[:60]))
            continue
        if n > 1:
            sys.exit(f"FATAL: pattern found {n} times, aborting: {old[:60]!r}")
        s = s.replace(old, new)
        applied.append(("apply", old[:60]))
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)
    return applied


def write_env(repo_dir: str, out: str) -> str:
    token = secrets.token_urlsafe(32)
    if os.path.isfile(out):
        # اگر فایل از قبل هست، توکن قبلی را نگه دار (idempotent)
        prev = io.open(out, encoding="utf-8").read()
        m = re.search(r"^PROXY_API_TOKEN=(.+)$", prev, re.M)
        if m:
            token = m.group(1).strip()
    lines = [
        "# ===== Vortex Gateway — تنظیمات پیشنهادی برای پروکسی AI (لایتنر) =====",
        "# Allowlist دامنه‌های AI که اپ لایتنر به آن‌ها نیاز دارد:",
        "PROXY_REQUIRE_ALLOWLIST=1",
        "PROXY_ALLOWED_DOMAINS=" + ",".join(AI_ALLOWLIST.split(",")),
        "",
        "# Origin های مجاز CORS (همان اپ‌های مرورگری):",
        "CORS_EXTRA_ORIGINS=" + ",".join(DEFAULT_ORIGINS.split(",")),
        "",
        "# توکن پروکسی برای PWA لایتنر (Authorization: Bearer <token> یا X-Vortex-Token):",
        "PROXY_API_TOKEN=" + token,
        "",
        "# ذخیره‌سازی (Railway: یک Volume روی /data بساز)",
        "DB_PATH=/data/vortex_data.db",
        "LOG_PATH=/data/vortex.log",
        "",
        "# امنیت",
        "MAX_HTTP_BODY_BYTES=2097152",
        "PROXY_MAX_RESPONSE_BYTES=52428800",
        "PROXY_ALLOWED_PORTS=80,443,8080,8443",
    ]
    content = "\n".join(lines) + "\n"
    with io.open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    return token


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="پچ Vortex برای پروکسی AI")
    ap.add_argument("repo", help="مسیر کلون Vortex (پوشه‌ای که main.py دارد)")
    ap.add_argument("--out-env", default=None, help="مسیر خروجی فایل .env (پیش‌فرض: <repo>/.env.ai)")
    args = ap.parse_args()

    repo = os.path.abspath(args.repo)
    if not os.path.isfile(os.path.join(repo, "main.py")):
        sys.exit(f"main.py در {repo} پیدا نشد")

    applied = apply(repo)
    for kind, what in applied:
        print(f"[{kind}] {what}")

    out = args.out_env or os.path.join(repo, ".env.ai")
    token = write_env(repo, out)
    print(f"[env]   نوشته شد: {out}")
    print("[env]   PROXY_API_TOKEN تولید شد؛ مقدار secret در خروجی چاپ نمی‌شود")
    print("[done] حالا می‌توانید deploy کنید (railway up / docker compose up)")


if __name__ == "__main__":
    main()
