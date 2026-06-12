#!/usr/bin/env node
/**
 * 内部リンクチェッカー
 *
 * 全HTMLページの href / src のうちサイト内パス（/ で始まるもの）を抽出し、
 * リンク先のファイルが存在するか検査する。外部URL（http/https/mailto）は対象外。
 *
 *   node tools/check-links.mjs
 *
 * 終了コード: リンク切れがあれば 1
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// 旧サイト・デザインプロトタイプは検査対象外
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'legacy', 'renewal', 'tools']);

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* htmlFiles(abs);
    } else if (name.endsWith('.html')) {
      yield abs;
    }
  }
}

const broken = [];
let checked = 0;

for (const file of htmlFiles(ROOT)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue; // サイト内絶対パスのみ
    const path = url.split(/[?#]/)[0]; // クエリ・フラグメントを除去
    const target = path.endsWith('/') ? `${path}index.html` : path;
    if (!existsSync(join(ROOT, target))) {
      broken.push(`${relative(ROOT, file)} → ${url}`);
    }
    checked++;
  }
}

if (broken.length) {
  console.error(`リンク切れ ${broken.length} 件:`);
  for (const b of [...new Set(broken)]) console.error(`  - ${b}`);
  process.exit(1);
}
console.log(`OK: 内部リンク ${checked} 件すべて解決`);
