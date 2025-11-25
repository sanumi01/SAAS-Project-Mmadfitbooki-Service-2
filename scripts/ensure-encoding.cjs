#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/ensure-encoding.cjs --dir <dir> [--fix]');
  process.exit(1);
}

const args = process.argv.slice(2);
let dir = 'dist';
let fix = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i+1]) { dir = args[i+1]; i++; }
  else if (args[i] === '--fix') { fix = true; }
  else if (args[i] === '--help') { usage(); }
}

const root = path.resolve(process.cwd(), dir);
if (!fs.existsSync(root)) {
  console.error(`Directory not found: ${root}`);
  process.exit(0);
}

const textExt = new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx','.css','.html','.json','.txt','.svg','.map','.xml','.md','.csv','.yml','.yaml']);
const binaryExt = new Set(['.png','.jpg','.jpeg','.gif','.ico','.webp','.woff','.woff2','.eot','.ttf','.otf','.gz','.zip','.tar','.mp3','.mp4']);

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dirPath, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const allFiles = walk(root);
const suspect = [];

for (const file of allFiles) {
  const ext = path.extname(file).toLowerCase();
  if (binaryExt.has(ext)) continue;
  // Only check likely text files; if extension unknown, try to check if the file content looks binary
  if (!textExt.has(ext)) {
    // quick binary check: if buffer contains a 0 byte within the first 800 bytes, treat as binary
    const head = fs.readFileSync(file, {encoding: null, flag: 'r'}).slice(0,800);
    if (head.includes(0)) continue;
  }

  const buf = fs.readFileSync(file);
  const s = buf.toString('utf8');
  if (s.includes('\uFFFD')) {
    suspect.push(file);
    if (fix) {
      try {
        const backup = file + '.bak-encoding';
        if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
        const fixed = s.replace(/\uFFFD/g, '');
        fs.writeFileSync(file, fixed, 'utf8');
      } catch (err) {
        console.error('Failed to fix', file, err.message);
      }
    }
  }
}

const report = {
  directory: root,
  scanned: allFiles.length,
  suspectCount: suspect.length,
  suspects: suspect
};

const outPath = path.resolve(process.cwd(), 'encoding-fix-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`Scanned ${report.scanned} files under ${report.directory}`);
console.log(`Found ${report.suspectCount} files containing replacement characters (\uFFFD).`);
if (report.suspectCount) console.log('See encoding-fix-report.json for details.');

process.exit(0);
