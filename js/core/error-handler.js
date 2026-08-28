// ═══════════════════════════════════════════
// ERROR BOUNDARY HELPER
// ═══════════════════════════════════════════
function withErrorBoundary(fn, fallback) {
  return function() {
    try {
      return fn.apply(this, arguments);
    } catch (err) {
      console.error('[ErrorBoundary]', err);
      if (typeof toast === 'function') {
        toast('خطا در اجرای بخش: ' + (err.message || 'ناشناخته'), 'error');
      }
      if (fallback) {
        try {
          return fallback.apply(this, arguments);
        } catch (e2) {
          console.error('[ErrorBoundary fallback]', e2);
        }
      }
      // Return minimal safe HTML
      var c = arguments[0];
      if (c && c.innerHTML !== undefined) {
        c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><div class="empty"><div class="icon">⚠️</div><p>خطا در نمایش این بخش</p><p style="font-size:.8rem;color:var(--text2);margin-top:8px">' + esc(err.message || '') + '</p><button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="location.reload()">بازنشانی صفحه</button></div></div>';
      }
    }
  };
}
