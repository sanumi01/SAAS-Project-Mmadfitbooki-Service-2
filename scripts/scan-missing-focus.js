const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];

  const interactiveTagRegex = /<(button|input|select|textarea|a)\b([^>]*)>/gi;
  let match;
  while ((match = interactiveTagRegex.exec(content)) !== null) {
    const tag = match[1];
    const attrs = match[2];
    const hasClassAttr = /className\s*=\s*(\{)?\s*['\"]([^'\"]*)['\"]/i.exec(match[0]);
    const hasFocusRing = /focus-ring/.test(match[0]);
    if (!hasFocusRing) {
      // compute line number for match
      const prefix = content.slice(0, match.index);
      const lineNumber = prefix.split('\n').length;
      results.push({ tag, line: lineNumber, snippet: match[0].trim() });
    }
  }
  return results;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const scanDirs = [path.join(root, 'components'), path.join(root, 'views'), path.join(root, 'src')];
  const allFiles = [];
  scanDirs.forEach((d) => {
    if (fs.existsSync(d)) {
      walk(d, allFiles);
    }
  });

  const report = [];
  allFiles.forEach((f) => {
    const misses = scanFile(f);
    if (misses.length) report.push({ file: f, misses });
  });

  const out = { scanned: allFiles.length, report };
  fs.writeFileSync(path.join(root, 'focus-scan-report.json'), JSON.stringify(out, null, 2));
  console.log(`Scanned ${out.scanned} files; ${out.report.length} files with missing focus-ring.`);
}

main();
