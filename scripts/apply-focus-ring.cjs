const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'focus-scan-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('focus-scan-report.json not found. Run the scanner first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
let totalEdits = 0;

report.report.forEach((entry) => {
  const file = entry.file;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  entry.misses.forEach((miss) => {
    const tag = miss.tag;
    // Build regex to find the specific tag occurrence near the reported line.
    // We'll find the first opening tag occurrence after the reported line.
    const lines = content.split('\n');
    const targetIndex = Math.max(0, miss.line - 3); // start a few lines earlier
    const searchWindow = lines.slice(targetIndex, Math.min(lines.length, miss.line + 3)).join('\n');

    // Try direct replacements in the whole file but limited to the tag
    // 1) className="..." pattern
    const classStrRegex = new RegExp(`(<${tag}[^>]*className=\")([^\"]*)(\")`, 'g');
    content = content.replace(classStrRegex, (full, p1, p2, p3) => {
      if (/\bfocus-ring\b/.test(p2)) return full; // already has
      totalEdits++;
      return `${p1}${p2} focus-ring${p3}`;
    });

    // 2) className={`...`} template literal
    const classTplRegex = new RegExp(`(<${tag}[^>]*className=\{\`)([^\`]*)(\`\})`, 'g');
    content = content.replace(classTplRegex, (full, p1, p2, p3) => {
      if (/\bfocus-ring\b/.test(p2)) return full;
      totalEdits++;
      return `${p1}${p2} focus-ring${p3}`;
    });

    // 3) className={`... ${expr}`} style (a bit more generic): className={`...`}
    const classExprRegex = new RegExp(`(<${tag}[^>]*className=\{)([^}]*)(\})`, 'g');
    content = content.replace(classExprRegex, (full, p1, p2, p3) => {
      if (/\bfocus-ring\b/.test(p2)) return full;
      // Only add when p2 contains a template literal or string
      if (/`/.test(p2) || /['\"]/.test(p2)) {
        totalEdits++;
        return `${p1}
          ${p2.includes('`') ? p2.replace(/`([^`]*)`/, (m, inner) => `
            ` + '`' + inner + ' focus-ring`') : p2.replace(/['\"]([^'\"]*)['\"]/, (m, inner) => `"${inner} focus-ring"`)}${p3}`;
      }
      return full;
    });

    // 4) If tag has no className at all, inject className="focus-ring"
    const tagNoClassRegex = new RegExp(`(<${tag}((?!className)[^>])*?)(>)`, 'g');
    content = content.replace(tagNoClassRegex, (full, p1, p2, p3) => {
      // Heuristic: only inject for tags that have an onClick or type or aria-label nearby to avoid adding to incidental tags
      if (/onClick|type=|aria-label|href=/.test(p1)) {
        // ensure we don't double-insert
        if (/className=/.test(full)) return full;
        totalEdits++;
        return `${p1} className=\"focus-ring\"${p3}`;
      }
      return full;
    });
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}`);
  }
});

console.log(`Total edits: ${totalEdits}`);
