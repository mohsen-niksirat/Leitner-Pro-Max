# معماری Leitner Pro Max (نسخه ۵)

این سند نقشه دقیق ماژولهای برنامه است. `legacy-main.js` (۹٬۳۵۱ خط) در ۱۳ فاز
به ماژولهای واقعی تجزیه شد و **حذف شد**؛ اکنون فقط `js/core/boot.js` بهعنوان
Compatibility Layer باقی مانده است.

## بارگذاری (js/app.js)

`index.html` → `js/app.js` (ES Module) → اسکریپتهای کلاسیک را به ترتیب
`MODULES` لود میکند (کلاسیک، نه ESM، تا توابع سراسری با ترتیب مشخص تعریف شوند):

```
dependencies → constants → indexeddb → utils → state → error-handler →
vocabulary → backup → leaderboard → fsrs → review → toast → enrichment →
translation-popup → navigation → library → import → pdf/reader →
pdf/pdf-mobile → reading → export → statistics → calendar → dashboard →
settings → quiz → ai-manager → word-web → help-vocabforge → tags-drive →
packs → boot
```

`service-worker.js` PRECACHE دقیقاً همین فایلها را لیست میکند (برای آفلاین).

## ماژولها و مسئولیتها

### هسته (`js/core/`)
| فایل | محتوا |
|---|---|
| `constants.js` | ثابتهای سراسری (MS_PER_DAY، PDF_DEFAULT_SCALE و…) |
| `indexeddb.js` | openDB/idbPut/idbGet |
| `state.js` | defaultState، S (getter)، sanitizeCard، hydrateState، loadLegacyState، save (debounced) |
| `utils.js` | esc، uid، fmtDate، todayKey |
| `error-handler.js` | withErrorBoundary |
| `boot.js` | **Compatibility Layer**: بوت IDB، theme/sidebar، offline banner، render dispatch |

### ذخیرهسازی (`js/storage/`)
| فایل | محتوا |
|---|---|
| `backup.js` | آپشن state snapshot، shared deck، auto-backup (IndexedDB) |
| `state.js` | (همان core/state) |

### یادگیری (`js/learning/`)
| فایل | محتوا |
|---|---|
| `fsrs.js` | FSRS-5 (weights، fsrsNext، sm2Legacy، mapRating) |
| `review.js` | جلسه مرور (autoplay، rating، keyboard، word drill، memory tricks، speed review، listening) |
| `quiz.js` | آزمون (session، renderer، answer handler، undo، levels، eng-quiz) |

### واژگان (`js/vocabulary/`)
| فایل | محتوا |
|---|---|
| `vocabulary.js` | createCard، rebuildIndex، wordExists، frequency tiers |
| `enrichment.js` | dictionary/translation/etymology/morphology/collocation/frequency-rank |
| `library.js` | کتابخانه + حافظه بلندمدت (filter, pager, enrich per-row, deck manager, edit) |
| `import.js` | ویزارد ورود (text، staged، DOCX، Anki) |
| `export.js` | خروج/پشتیبان |

### PDF (`js/pdf/`)
| فایل | محتوا |
|---|---|
| `reader.js` | PDF reader (render، textLayer، selection، translation، bookmark) |
| `pdf-mobile.js` | PDF-mobile + quick import |

### خواندن (`js/reading/`)
| فایل | محتوا |
|---|---|
| `reading.js` | reading mode (pagination، translation batch، vocab view، modals) |

### آمار (`js/statistics/`)
| فایل | محتوا |
|---|---|
| `statistics.js` | charts، heatmap، forecast |
| `calendar.js` | smart calendar |
| `leaderboard.js` | leaderboard (localStorage) |

### AI (`js/ai/`)
| فایل | محتوا |
|---|---|
| `ai-manager.js` | AI chat کامل (providers، key rotation، streaming، image gen) |

### UI (`js/ui/`)
| فایل | محتوا |
|---|---|
| `navigation.js` | NAV_GROUPS، render() dispatch |
| `toast.js` | toast |
| `translation-popup.js` | double-click popup |
| `dashboard.js` | daily challenge، about |
| `settings.js` | renderSettings (تنظیمات، categories، drive) |

## Compatibility Layer (js/core/boot.js)

پس از حذف legacy-main.js، فقط بوت باقی ماند:
- `loadFromIDB().then()` — بارگذاری state از IndexedDB (یا مهاجرت legacy localStorage)
- `checkDriveOnLoad()`
- theme/sidebar/offline init
- `render()` dispatch (در navigation.js) + `render` override برای quiz

## تستها

| فایل | پوشش |
|---|---|
| `tests/smoke.spec.js` | رندر همه تبها + review flow |
| `tests/audit.spec.js` | مهاجرت v1/v2/خراب، PWA offline، flush-cache |
| `tests/pdf.spec.js` | PDF reader + pdf-mobile |
| `tests/vocabforge.spec.js` | VocabForge workflow |
| `tests/ai-chat.spec.js` | AI chat + provider table |
| `tests/vortex-proxy.spec.js` | Vortex proxy wiring |

## اصول refactor

- بدنه توابع عیناً کپی شد (بدون refactor منطقی)
- فایلها به ترتیب وابستگی در MODULES لود میشوند
- `service-worker.js` PRECACHE با هر تغییر همگام است
- بعد از هر فاز، کل suite + تستهای آن فاز اجرا شد
