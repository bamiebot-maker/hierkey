#!/usr/bin/env node
/**
 * scripts/security-scan-pr.mjs
 *
 * Automated Supply Chain & Malicious Contribution Scanner
 * Detects patterns identified in the Drips Wave 10 Security Advisory:
 *  - .vscode/tasks.json running arbitrary commands on folder open (runOn: folderOpen)
 *  - Suspicious lifecycle hooks (preinstall, postinstall, etc.) downloading binaries or piping shell
 *  - Known malware signatures (rmcej%otb%, Cot%3T=sthP, _$__1e42, etc.)
 *  - Disguised executable binaries in font/media extensions
 */

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();

// Known indicators from Wave 10 security advisory
const SUSPICIOUS_STRINGS = [
  'rmcej%otb%',
  'Cot%3T=sthP',
  '_$__1e42',
  'eval(Buffer.from',
  'eval(atob(',
  'Function(Buffer.from',
  '\\x65\\x76\\x61\\x6c', // hex for 'eval'
];

const SUSPICIOUS_FONTS_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];

const EXECUTABLE_MAGIC_BYTES = [
  Buffer.from([0x7f, 0x45, 0x4c, 0x46]), // ELF header
  Buffer.from([0x4d, 0x5a]),             // PE / MZ header
];

let violations = [];

function checkVsCodeTasks() {
  const tasksPath = path.join(REPO_ROOT, '.vscode', 'tasks.json');
  if (fs.existsSync(tasksPath)) {
    try {
      const content = fs.readFileSync(tasksPath, 'utf8');
      if (content.includes('folderOpen')) {
        violations.push({
          file: '.vscode/tasks.json',
          issue: 'Found "runOn: folderOpen" task. Auto-running commands on folder open is high-risk.',
        });
      }
      if (/command["']?\s*:\s*["'](curl|wget|bash|sh|powershell|cmd)/i.test(content)) {
        violations.push({
          file: '.vscode/tasks.json',
          issue: 'Found command invoking shell/curl/wget in vscode tasks.',
        });
      }
    } catch (e) {
      console.warn('Could not read .vscode/tasks.json:', e.message);
    }
  }
}

function checkPackageJson() {
  const pkgPath = path.join(REPO_ROOT, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const scripts = pkg.scripts || {};
      const hooks = ['preinstall', 'postinstall', 'install', 'prepublish', 'prepare'];
      for (const hook of hooks) {
        if (scripts[hook]) {
          const val = scripts[hook];
          if (/curl|wget|http:|https:|nc\s|bash\s|powershell/i.test(val)) {
            violations.push({
              file: 'package.json',
              issue: `Suspicious network/script activity detected in lifecycle script "${hook}": ${val}`,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse package.json:', e.message);
    }
  }
}

function scanFilesRecursively(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(REPO_ROOT, fullPath);

    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === 'coverage' ||
      entry.name === '.mythril-venv' ||
      entry.name === 'target'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      scanFilesRecursively(fullPath);
    } else if (entry.isFile()) {
      // 1. Check for disguised executables in font files
      const ext = path.extname(entry.name).toLowerCase();
      if (SUSPICIOUS_FONTS_EXTENSIONS.includes(ext)) {
        try {
          const buffer = fs.readFileSync(fullPath);
          for (const magic of EXECUTABLE_MAGIC_BYTES) {
            if (buffer.length >= magic.length && buffer.subarray(0, magic.length).equals(magic)) {
              violations.push({
                file: relPath,
                issue: `Disguised executable binary detected inside font file (${ext})!`,
              });
            }
          }
        } catch {
          // ignore
        }
      }

      // 2. Check for known malware markers in source and config files
      if (/\.(ts|tsx|js|mjs|cjs|json|yaml|yml|md|html|sh|ps1)$/i.test(entry.name)) {
        // Skip this scanner script itself when searching for malware signatures
        if (relPath.includes('security-scan-pr.mjs')) continue;

        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const marker of SUSPICIOUS_STRINGS) {
            if (content.includes(marker)) {
              violations.push({
                file: relPath,
                issue: `Found known malware token or suspicious eval construction: "${marker}"`,
              });
            }
          }
        } catch {
          // ignore binary / unreadable files
        }
      }
    }
  }
}

console.log('🛡️  Running SpooVault PR & Supply-Chain Security Scanner...');
checkVsCodeTasks();
checkPackageJson();
scanFilesRecursively(REPO_ROOT);

if (violations.length > 0) {
  console.error('\n❌ SECURITY VIOLATIONS DETECTED:');
  for (const v of violations) {
    console.error(` - [${v.file}] ${v.issue}`);
  }
  process.exit(1);
} else {
  console.log('✅ Supply-chain security check passed. No malicious patterns or suspicious hooks found.\n');
  process.exit(0);
}
