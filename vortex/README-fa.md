# 🌀 Vortex Gateway — راهنمای دیپلوی برای پروکسی AI (لایتنر)

این راهنما به شما کمک می‌کند سرور [Vortex Gateway](https://github.com/VortexWorker/vortex) را
(نسخه `4.1-hardened` — پروکسی VLESS-over-WebSocket با داشبورد مدیریت) روی **Railway** یا
**Docker** بالا بیاورید تا:

1. **محدودیت IP/منطقه‌ای** ارائه‌دهنده‌های AI (مثل `User location is not supported` گوگل) را دور بزند.
2. فقط به **دامنه‌های AI مجاز** (allowlist) اجازه عبور بدهد — نه هر سایتی.
3. **CORS** برای اپ لایتنر (GitHub Pages) فعال باشد تا لایتنر بتواند مستقیم از مرورگر از آن استفاده کند.

> ⚠️ **چه چیزی را حل نمی‌کند:** محدودیت‌های مبتنی بر **اکانت** (منطقه اکانت گوگل، روش پرداخت،
> شماره تلفن) با پروکسی IP حل نمی‌شوند. همچنین سهمیه رایگان کلیدها (مثلاً ۲۰ ریکوئست در روز
> Gemini Flash) دست‌نخورده می‌ماند.

---

## 📦 فایل‌های این پوشه

| فایل | نقش |
|---|---|
| `apply-patch.py` | پچ کوچک و امن روی `main.py` (CORS + توکن پروکسی) + تولید `.env.ai` |
| `deploy-railway.sh` | دیپلوی خودکار روی Railway (کلون → پچ → ست متغیرها → `rail up`) |
| `deploy-docker.sh` | اجرای محلی/سرور با Docker (کلون → پچ → build → run) |
| `docker-compose.yml` | جایگزین Docker ساده با compose |
| `README-fa.md` | همین راهنما |

---

## 🧠 چرا به پچ نیاز است؟ (مهم)

کد اصلی Vortex دو محدودیت برای استفاده از مرورگر (PWA) دارد:

1. **CORS:** `_allowed_origins()` فقط Origin های خودش (پنل، `localhost:8000`، Worker) را می‌پذیرد.
   Origin لایتنر (`https://mohsen-niksirat.github.io`) را رد می‌کند.
2. **احراز هویت:** اند‌پوینت `/api/proxy/...` فقط با **کوکی سشن** کار می‌کند؛ PWA روی origin دیگر
   نمی‌تواند لاگین/کوکی بفرستد.

پچ `apply-patch.py` دو متغیر محیطی اضافه می‌کند:

| متغیر | اثر |
|---|---|
| `CORS_EXTRA_ORIGINS` | لیست Origin های مجاز CORS (مثلاً لایتنر) |
| `PROXY_API_TOKEN` | اگر ست شود، `/api/proxy` با هدر `Authorization: Bearer <token>` هم کار می‌کند (بدون کوکی) |

پچ **idempotent** است (اجرای دوباره تغییری ایجاد نمی‌کند) و اگر الگوی کد تغییر کرده باشد، با
خطا متوقف می‌شود تا چیزی را خراب نکند.

---

## 🚀 روش ۱ — Railway (پیشنهادی برای استفاده روزمره)

### پیش‌نیاز
- حساب [Railway](https://railway.app) + کارت بانکی (free tier نیاز به کارت دارد، ~۵ دلار/ماه).
- Railway CLI: `npm i -g @railway/cli` (یا از [railway.app/install](https://railway.app/install)).

### مراحل
```bash
# ۱) از ریشه همین ریپو:
bash vortex/deploy-railway.sh
```
اسکریپت این کارها را می‌کند:
1. کلون Vortex در `.vortex-src/`
2. اجرای `apply-patch.py` (پچ + ساخت `.env.ai` با allowlist دامنه‌های AI و توکن تصادفی)
3. `rail login` و ساخت پروژه `vortex-ai`
4. انتقال همه متغیرهای `.env.ai` به Railway
5. ساخت Volume روی `/data` (برای ماندگاری دیتابیس)
6. `rail up`

### بعد از دیپلوی
- آدرس عمومی را از داشبورد Railway کپی کن (حالت `https://<name>.up.railway.app`).
- تست سلامت:
  ```bash
  curl https://<domain>.up.railway.app/health/ready
  ```
- تست پروکسی با توکن:
  ```bash
  curl -H "Authorization: Bearer <PROXY_API_TOKEN>" \
       "https://<domain>.up.railway.app/api/proxy/https://api.openrouter.ai/api/v1/models"
  ```
- توکن را در لایتنر (تنظیمات AI ← پروکسی سفارشی) وارد کن.

> اگر `rail volume create` جواب نداد، در داشبورد Railway → Project → **Volumes** → یک Volume با
> mount path `/data` بساز و دوباره `rail up`.

---

## 🐳 روش ۲ — Docker (محلی یا سرور خودت)

```bash
# گزینه A: اسکریپت
bash vortex/deploy-docker.sh

# گزینه B: دستی با compose
python vortex/apply-patch.py ./vortex-src            # کلون + پچ + .env.ai
cd vortex-src && docker compose up -d
```

تست:
```bash
curl http://localhost:8000/health/ready
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/proxy/https://api.openrouter.ai/api/v1/models"
```

---

## 🔒 دامنه‌های مجاز (allowlist)

`apply-patch.py` این allowlist را تولید می‌کند (همان دامنه‌هایی که لایتنر واقعاً استفاده می‌کند):

| سرویس | دامنه |
|---|---|
| Gemini | `generativelanguage.googleapis.com` |
| OpenRouter | `api.openrouter.ai` |
| Groq | `api.groq.com` |
| Pollinations (متن/تصویر) | `image.pollinations.ai` `gen.pollinations.ai` `text.pollinations.ai` `enter.pollinations.ai` |
| دیکشنری (VocabForge) | `api.dictionaryapi.dev` |
| ترجمه فارسی | `api.mymemory.translated.net` |
| ریشه‌شناسی / Word Web | `en.wiktionary.org` |
| مترادف | `api.datamuse.com` |
| پروکسی‌های عمومی | فعال نیستند؛ درخواست‌های دارای کلید فقط باید از Vortex عبور کنند |

می‌توانی `PROXY_ALLOWED_DOMAINS` را در `.env.ai` ویرایش کنی. اگر خالی بماند، پروکسی **fail-closed**
است (هیچ دامنه‌ای اجازه ندارد).

---

## 🌐 CORS برای لایتنر

`CORS_EXTRA_ORIGINS` به صورت پیش‌فرض شامل:
```
https://mohsen-niksirat.github.io,http://localhost:5173,http://127.0.0.1:8794,http://localhost:8000
```
اگر لایتنر را روی دامنه دیگری (مثلاً دامنه شخصی) میزبانی می‌کنی، آن را هم به این لیست اضافه کن.

---

## 🔐 امنیت

- `PROXY_API_TOKEN` را **Secret** نگه دار؛ هر کس آن را داشته باشد می‌تواند از پروکسی تو استفاده کند.
- مقدار توکن را در log، خروجی deploy یا frontend عمومی قرار نده.
- برای استفاده عمومی حتماً rate limit، محدودیت مصرف و مانیتورینگ هزینه را در gateway فعال کن.
- `PROXY_ALLOWED_DOMAINS` را خالی نگذار (fail-closed).
- `ADMIN_PASSWORD` در اولین اجرا از طریق داشبورد ست می‌شود؛ رمز پیش‌فرض وجود ندارد.
- هرگز `.env.ai`، دیتابیس یا لاگ را commit نکن (فایل‌های `.env*` در `.gitignore` سرور هستند).
- برای استفاده از VLESS روی گوشی (v2rayNG) نیازی به این پچ‌ها نیست — لینک VLESS را از داشبورد
  بردار و در اپ v2rayNG وارد کن؛ کل ترافیک از تونل رد می‌شود.

---

## 🧪 تست دستی از مرورگر (لایتنر)

بعد از دیپلوی، در کنسول مرورگر لایتنر (روی صفحه AI):
```js
fetch('https://<domain>.up.railway.app/api/proxy/https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY', {
  headers: { 'Authorization': 'Bearer <PROXY_TOKEN>' }
}).then(r => r.json()).then(console.log)
```
اگر لیست مدل‌ها برگشت، یعنی allowlist + CORS + توکن همه درست کار می‌کنند.

---

## ❓ سوالات

- **چرا خطای region هنوز هست؟** اگر گوگل بر اساس **اکانت** (نه IP) تشخیص دهد، پروکسی کمکی نمی‌کند.
- **کلید رایگان Gemini بهتر می‌شود؟** خیر؛ سهمیه همان است.
- **ریسک بسته‌شدن اکانت؟** استفاده دائمی از IP دیتاسنتر ممکن است اکانت‌های رایگان را محدود کند؛ با
  مسئولیت خودت.
