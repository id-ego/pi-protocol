import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const forbidden = ['apps/', '@repo/pi-os-api', '@repo/pi-os-web', '@repo/pi-works', '@repo/legacy-protocol'];
const matches: string[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!path.endsWith('.ts')) continue;
    const text = readFileSync(path, 'utf8');
    for (const pattern of forbidden) {
      if (text.includes(pattern)) {
        matches.push(`${path}: contains ${pattern}`);
      }
    }
  }
}

walk('src');

if (matches.length > 0) {
  throw new Error(`pi-protocol boundary failed:\n${matches.join('\n')}`);
}

console.log('pi-protocol boundary ok');
