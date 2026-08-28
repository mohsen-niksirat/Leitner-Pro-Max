#!/usr/bin/env bash
# =============================================================================
# deploy-railway.sh — دیپلوی گام‌به‌گام Vortex Gateway روی Railway
# (با allowlist دامنه‌های AI + CORS برای لایتنر + توکن پروکسی)
#
# پیش‌نیازها:
#   - Git Bash (ویندوز) یا bash (لینوکس/macOS)
#   - Railway CLI  →  npm i -g @railway/cli   (یا https://railway.app/install)
#   - حساب Railway + کارت (free tier نیاز به کارت دارد)
#
# استفاده:
#   bash vortex/deploy-railway.sh [--auto]
#   --auto: بدون سؤال، همه‌چیز را خودکار انجام بده (برای CI/ری‌دیپلوی)
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
VORTEX_DIR="${VORTEX_DIR:-$ROOT/.vortex-src}"
AUTO="${1:-}"

command -v git >/dev/null || { echo "❌ git نصب نیست"; exit 1; }
command -v rail >/dev/null || { echo "❌ Railway CLI نصب نیست. دستور: npm i -g @railway/cli"; exit 1; }

echo "── ۱) کلون Vortex (نسخه 4.1-hardened)"
if [ ! -d "$VORTEX_DIR/.git" ]; then
  git clone --depth 1 https://github.com/VortexWorker/vortex.git "$VORTEX_DIR"
else
  (cd "$VORTEX_DIR" && git pull --ff-only) || true
fi

echo "── ۲) اعمال پچ‌ها (CORS + توکن پروکسی) و تولید .env.ai"
python "$ROOT/vortex/apply-patch.py" "$VORTEX_DIR"
ENV_FILE="$VORTEX_DIR/.env.ai"
[ -f "$ENV_FILE" ] || { echo "❌ .env.ai ساخته نشد"; exit 1; }

echo "── ۳) Railway: لاگین + پروژه"
if [ -z "$AUTO" ]; then
  rail login
else
  echo "(حالت --auto: فرض می‌کنیم rail login انجام شده)"
fi
if [ ! -f "$VORTEX_DIR/railway.toml" ]; then
  (cd "$VORTEX_DIR" && rail init --name vortex-ai)
fi
(cd "$VORTEX_DIR" && rail link 2>/dev/null || true)

echo "── ۴) ست کردن محیط و دیپلوی"
# متغیرهای امن را از .env.ai به Railway منتقل کن (توکن/کلیدها)
while IFS= read -r line; do
  case "$line" in
    ''|\#*) continue ;;
  esac
  key="${line%%=*}"
  val="${line#*=}"
  (cd "$VORTEX_DIR" && rail variables set "$key=$val" >/dev/null)
done < "$ENV_FILE"

# یک Volume روی /data بساز (داده‌ها بین دیپلوی‌ها بماند)
(cd "$VORTEX_DIR" && rail volume create data --mount /data 2>/dev/null || echo "⚠️ اگر Volume ساخته نشد، در داشبورد Railway → Project → Volumes بساز (mount: /data)")

(cd "$VORTEX_DIR" && rail up)

echo ""
echo "✅ دیپلوی انجام شد. آدرس عمومی را از Railway بگیر و تست کن:"
echo "   curl https://<your-domain>.up.railway.app/health/ready"
echo "   توکن پروکسی در Secret محیط Railway و $ENV_FILE تنظیم شد. مقدار آن چاپ نمی‌شود."
echo "⚠️ توکن را فقط از Secret manager به لایتنر (تنظیمات AI ← پروکسی سفارشی) منتقل کن."
