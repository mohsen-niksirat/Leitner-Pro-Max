#!/usr/bin/env bash
# =============================================================================
# deploy-docker.sh — اجرای Vortex Gateway با Docker (محلی یا روی هر سرور)
#
# پیش‌نیاز: Docker نصب و اجرا باشد.
# استفاده:
#   bash vortex/deploy-docker.sh [--port 8000] [--name vortex-ai]
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
VORTEX_DIR="${VORTEX_DIR:-$ROOT/vortex-src}"
PORT="${PORT:-8000}"
NAME="${NAME:-vortex-ai}"

command -v docker >/dev/null || { echo "❌ Docker نصب نیست"; exit 1; }

echo "== ۱/۳ کلون + پچ"
if [ ! -d "$VORTEX_DIR/.git" ]; then
  git clone --depth 1 https://github.com/VortexWorker/vortex.git "$VORTEX_DIR"
fi
python3 "$ROOT/vortex/apply-patch.py" "$VORTEX_DIR"
ENV_FILE="$VORTEX_DIR/.env.ai"
[ -f "$ENV_FILE" ] || { echo "❌ .env.ai ساخته نشد"; exit 1; }

echo "== ۲/۳ ساخت تصویر"
(cd "$VORTEX_DIR" && docker build -t vortex-gateway .)

echo "== ۳/۳ اجرا با Volume و env"
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d \
  --name "$NAME" \
  -p "$PORT:8000" \
  -v vortex_data:/data \
  --env-file "$ENV_FILE" \
  --restart unless-stopped \
  vortex-gateway

echo ""
echo "✅ اجرا شد:  http://localhost:$PORT/health/ready"
echo "   لاگ:      docker logs -f $NAME"
echo "   متوقف:    docker stop $NAME"
echo "   توکن:     در $ENV_FILE ذخیره شد (مقدار secret چاپ نمی‌شود)"
