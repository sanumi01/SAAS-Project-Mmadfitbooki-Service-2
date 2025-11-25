# Build sizes — After lazy-loading ChatWidget (2025-11-22)

Build produced by: `npm run build` (Vite) after lazy-loading `ChatWidget`.

Top assets (sorted by size):

- `dist/assets/ChatWidget-CTLDU1uq.js` — 249,393 bytes (~243.6 KB)
- `dist/assets/index-CUt8TGfv.js` — 157,466 bytes (~153.8 KB)
- `dist/assets/BookingView-DZpjMRdp.js` — 29,877 bytes (~29.2 KB)
- `dist/assets/LoginView-zDpBhrc_.js` — 6,254 bytes (~6.1 KB)
- `dist/assets/CustomerDashboardView-CiS_pfXZ.js` — 2,832 bytes (~2.8 KB)
- `dist/sw.js` — 2,243 bytes (~2.2 KB)
- `dist/index.html` — 1,945 bytes (~1.9 KB)
- `dist/assets/Card-D5up0EIk.js` — 205 bytes

Observations:
- The main `index-*.js` bundle dropped from ~407 KB to ~157 KB — a ~250 KB reduction in the initial bundle.
- The `ChatWidget` is now a separate chunk (~249 KB). The app will load it on demand when the widget is first rendered.

Recommendations:
- Consider also lazy-loading other heavy views (e.g., `BookingView`, `CustomerDashboardView`) if they are not needed on first render for your typical user flow.
- Use dynamic imports for larger admin/analytics pages that are infrequently used.

Next steps:
- Commit these changes to `contrast-accessibility-fix` branch and open a PR including both `BUILD_SIZES_AFTER.md` and `BUILD_SIZES_AFTER_2.md`.
