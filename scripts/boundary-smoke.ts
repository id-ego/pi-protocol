import { spawnSync } from 'node:child_process';

const forbidden = ['apps/', '@repo/pi-os-api', '@repo/pi-os-web', '@repo/pi-works', '@repo/legacy-protocol'];
const result = spawnSync('rg', ['-n', forbidden.join('|'), 'src'], { encoding: 'utf8' });

if (result.status === 0) {
  throw new Error(`pi-protocol boundary failed:\n${result.stdout}`);
}
if (result.status !== 1) {
  throw new Error(`failed to run boundary check: ${result.stderr}`);
}
console.log('pi-protocol boundary ok');
