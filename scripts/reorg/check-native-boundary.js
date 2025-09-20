#!/usr/bin/env node
/**
 * check-native-boundary.js
 *
 * Ensures no new com.sallie.* Kotlin/Java sources live outside the allowed tree:
 *   android/src/(main|test|demo)/java
 *
 * Ignored paths: node_modules, scripts/reorg/trash, build, .git, manifests, reports.
 * Warning mode default. Set STRICT_NATIVE_BOUNDARY=1 to force non-zero exit when violations found.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const ALLOW_REGEX = /android[\\/ ]src[\\/](main|test|demo)[\\/]java[\\/]/;
const VIOLATIONS = [];
const SKIP_DIRS = new Set(['.git', 'node_modules', '.gradle', 'build', 'dist', 'scripts']);

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        const rel = path.relative(ROOT, full).replace(/\\/g, '/');
        if (e.isDirectory()) {
            if (SKIP_DIRS.has(e.name)) continue;
            if (/scripts\/reorg\/trash/.test(rel)) continue;
            walk(full);
        } else if (e.isFile()) {
            if (!/\.(kt|java)$/.test(e.name)) continue;
            let content;
            try { content = fs.readFileSync(full, 'utf8'); } catch { continue; }
            if (!/package\s+com\.sallie/.test(content)) continue;
            if (ALLOW_REGEX.test(rel)) continue;
            VIOLATIONS.push(rel);
        }
    }
}

walk(ROOT);

if (!VIOLATIONS.length) {
    console.log('Native boundary check: OK (no violations)');
    process.exit(0);
}

console.warn('Native boundary violations (' + VIOLATIONS.length + ')');
VIOLATIONS.slice(0, 50).forEach(v => console.warn('  -', v));
if (VIOLATIONS.length > 50) console.warn('  ...', VIOLATIONS.length - 50, 'more');

if (process.env.STRICT_NATIVE_BOUNDARY) {
    console.error('Failing due to STRICT_NATIVE_BOUNDARY=1');
    process.exit(1);
} else {
    console.log('Non-strict mode: exit 0 (set STRICT_NATIVE_BOUNDARY=1 to enforce)');
    process.exit(0);
}
