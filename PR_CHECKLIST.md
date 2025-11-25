## PR Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Focus-scan reviewed (`focus-scan.txt`)
- [ ] Visual keyboard navigation smoke test performed
- [ ] Confirm no unrelated deletions are included (backup branch created)
- [ ] Merge approved

Notes:
- Backup branch: `backup/mass-delete-20251124-213622` (contains original mass-deletion commit).
- If you want me to run a visual a11y test (axe/Pa11y) I can add it to CI and provide the report.
- [ ] Confirm visual styles on main flows (Header, Login, Booking, Admin).
- [ ] Keyboard test: Tab through interactive elements (buttons, inputs, links).
- [ ] Screen-reader smoke test for updated components (labels/aria live regions).
- [ ] Run `npm run build` and open `dist/bundle-visualizer.html` to review bundle split.
- [ ] Approve reviewers and merge after approvals.
