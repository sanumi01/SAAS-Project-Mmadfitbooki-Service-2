# Build sizes — After accessibility & contrast fixes (2025-11-22)

Build produced by: `npm run build` (Vite)

Top assets (sorted by size):

- `dist/assets/index-DAavsuOf.js` — 407,329 bytes (~398 KB)
- `dist/assets/BookingView-CrourR0H.js` — 29,877 bytes (~29.2 KB)
- `dist/assets/LoginView-JeSYkU7e.js` — 6,254 bytes (~6.1 KB)
- `dist/assets/CustomerDashboardView-BAeYfmvQ.js` — 2,832 bytes (~2.8 KB)
- `dist/sw.js` — 2,243 bytes (~2.2 KB)
- `dist/index.html` — 1,945 bytes (~1.9 KB)
- `dist/assets/Card-AcTICDPs.js` — 205 bytes

Notes:
- `index-*.js` remains the largest bundle. Further code-splitting and route-based lazy-loading can reduce initial bundle size.
- If you want a before/after comparison, I can run a baseline build from the original `main` commit (or create a baseline snapshot) and generate `BUILD_SIZES_BEFORE.md`.

Next steps:
- Commit these changes to a branch and open a PR (if you approve).
- Or iterate further on code-splitting to shrink `index-*.js`.
