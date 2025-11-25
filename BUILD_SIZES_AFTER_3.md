# Build sizes — After lazy-loading Admin & Staff views (2025-11-22)

Build produced by: `npm run build` (Vite) after lazy-loading `ChatWidget`, `ManagementView`, and `StaffDashboardView`.

Top assets (sorted by size):

- `dist/assets/index-DRcgqFRx.js` — 249,217 bytes (~243.5 KB)
- `dist/assets/index-lIqizEXQ.js` — 158,373 bytes (~154.6 KB)
- `dist/assets/AdminView-whj0xRCo.js` — 25,968 bytes (~25.4 KB)
- `dist/assets/BookingView-BXWepmik.js` — 12,768 bytes (~12.5 KB)
- `dist/assets/settingsService-BsWrL4Wl.js` — 10,075 bytes (~9.8 KB)
- `dist/assets/bookingService-BWHIEAHo.js` — 8,930 bytes (~8.7 KB)
- `dist/assets/LoginView-Co3Bi2mZ.js` — 6,254 bytes (~6.1 KB)
- `dist/assets/ChatWidget-C-astCNe.js` — 5,500 bytes (~5.3 KB)
- `dist/assets/StaffDashboardView-88v5onaY.js` — 3,855 bytes (~3.8 KB)
- `dist/assets/CustomerDashboardView-N0B-JU10.js` — 2,459 bytes (~2.4 KB)

Notes:
- The main initial bundle remains split into two `index-*.js` chunks; the larger chunk is ~249 KB and secondary index chunk ~158 KB. The earlier ~407 KB main bundle is now spread across multiple entry chunks and separate lazy chunks.
- Admin and staff views are now separate chunks which reduces the immediate work for typical customer flows.

Recommendations:
- For deeper insight, add `build.sourcemap = true` to `vite.config.ts` and run `npx source-map-explorer` locally to generate HTML reports.
- Optionally use `rollup-plugin-visualizer` or `vite-plugin-bundle-analyzer` to generate a visual treemap of bundle composition.

Next actions I can take:
- Add `build.sourcemap = true` to `vite.config.ts`, rebuild and generate `dist/*.map` files, then run `npx source-map-explorer` to create `dist/bundle-report-index.html`.
- Provide step-by-step Windows instructions to install `gh` CLI and authenticate, so you can run `gh pr create` locally.
