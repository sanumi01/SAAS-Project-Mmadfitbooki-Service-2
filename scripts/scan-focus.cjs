const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const scanDirs = ['components', 'views', 'src'];
const exts = ['.tsx', '.ts', '.jsx', '.js'];

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === '.git') return;
      walk(full, filelist);
    } else if (exts.includes(path.extname(file))) {
      filelist.push(full);
    }
  });
  return filelist;
}

function findInteractiveMatches(content) {
  const matches = [];
  const tagRegex = /<\s*(button|input|textarea|select|a)\b[\s\S]*?>/gi;
  let m;
  while ((m = tagRegex.exec(content)) !== null) {
    const tag = m[0];
    const index = m.index;
    if (!/focus-ring/.test(tag)) {
      matches.push({ index, tag });
    }
  }

  const onclickRegex = /<\s*([a-zA-Z0-9_-]+)\b[\s\S]*?onClick=|role=\"button\"/gi;
  while ((m = onclickRegex.exec(content)) !== null) {
    const index = m.index;
    const start = content.lastIndexOf('<', index);
    const end = content.indexOf('>', index);
    if (start !== -1 && end !== -1) {
      const tag = content.substring(start, end + 1);
      if (!/focus-ring/.test(tag)) {
        matches.push({ index: start, tag });
      }
    }
  }

  return matches;
}

function lineNumberOfIndex(content, idx) {
  return content.substring(0, idx).split(/\r?\n/).length;
}

const results = [];
scanDirs.forEach(rel => {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return;
  const files = walk(dir);
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const matches = findInteractiveMatches(content);
      matches.forEach(m => {
        const ln = lineNumberOfIndex(content, m.index);
        const snippet = m.tag.replace(/\n/g, ' ').replace(/\s+/g, ' ').slice(0, 300);
        results.push({ file: path.relative(ROOT, file), line: ln, snippet });
      });
    } catch (err) {}
  });
});

if (results.length === 0) {
  console.log('No missing focus-ring occurrences found in scanned directories.');
  process.exit(0);
}

console.log('Found interactive elements that may be missing `focus-ring` (heuristic):');
results.forEach(r => {
  console.log(`${r.file}:${r.line}: ${r.snippet}`);
});

console.log('\nSummary: ' + results.length + ' potential missing items.');
process.exit(0);
