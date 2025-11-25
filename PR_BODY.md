## PR: Accessibility — focus-ring sweep and handler fixes

This PR contains focused accessibility fixes and supporting audit artifacts.

What changed:
- Repaired malformed JSX event handler syntax introduced by a prior automated applier (fixed ~20 files).
- Ensured interactive elements that were unintentionally changed now compile and the app builds.
- Added audit artifacts to help reviewers: `focus-scan.txt`, `build-log.txt`, `AUDIT_REPORT.md`.

Why:
- Programmatic applier introduced invalid JSX which caused the production build to fail. The fixes restore correct handlers and keep the `focus-ring` utility on interactive controls where appropriate.

Testing notes:
- Build: `npm run build` (succeeds)
- Lint: `npm run lint` (succeeds)
- Keyboard test: run dev server and tab through interactive elements to validate focus styles.

Backup & safety:
- A backup branch `backup/mass-delete-20251124-213622` contains the original mass-deletions commit. Nothing destructive was pushed from that commit.

Files to review:
- `AUDIT_REPORT.md`, `focus-scan.txt`, `build-log.txt` (attached to the branch)

Please review the flagged items in `focus-scan.txt` and advise which elements should intentionally not receive `focus-ring` (false positives). After that I can continue applying targeted fixes or open follow-up PRs.
## PR: Accessibility & Contrast Improvements + Focus Utility + Code-Splitting

### Summary
- Adds a design system and utility CSS (`styles/design-system.css`, `styles/utilities.css`) and imports them globally via `index.css`.
- Standardizes focus styles with a new `.focus-ring` utility and applies it across many interactive elements (inputs, buttons, links).
- Improves ARIA attributes, label associations, keyboard focus and color contrast across header, login, booking, admin and other components.
- Adds lazy-loading (React.lazy + Suspense) for heavy views/widgets to reduce initial bundle size.
- Includes build artifacts for bundle analysis (`dist/bundle-visualizer.html`, `build-log.txt`, `BUILD_SIZES_AFTER*.md`).

### Why
- Improve accessibility and keyboard usability.
- Reduce initial bundle size and improve perceived load.
- Unify styles for easier future maintenance.

### Files changed (high-level)
- Added: `styles/design-system.css`, `styles/utilities.css`, `PR_BODY.md`, `PR_CHECKLIST.md`
- Updated: `index.css` (imports), many components and views (e.g. `components/BookingForm.tsx`, `components/ChatWidget.tsx`, `components/Header.tsx`, `views/BookingView.tsx`, `views/LoginView.tsx`, admin components, etc.)
- Build artifacts: `dist/bundle-visualizer.html`, `build-log.txt`, `BUILD_SIZES_AFTER*.md`

### How to test locally
1. `npm install`
2. `npm run dev` — open the URL Vite prints (e.g. `http://localhost:3000/`)
3. Walk through Header navigation, Login form, Booking flow, Chat widget. Verify focus rings appear and color contrast is correct.
4. `npm run build` — review `build-log.txt` and open `dist/bundle-visualizer.html` to inspect bundle composition.

### Notes
- I attempted a Vite-native analyzer but hit a package-version error; the rollup visualizer treemap is included as a reliable artifact.
- Automated PR creation couldn't be done here because the GitHub CLI (`gh`) isn't available in this environment.

### Contact
If you find any visual regressions, share the component name or a screenshot and I will patch it.
