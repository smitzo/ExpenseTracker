import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const args = process.argv.includes('--local-history')
  ? ['--git-dir=.git-local', '--work-tree=.']
  : [];
const files = (
  process.argv.includes('--stdin')
    ? readFileSync(0, 'utf8')
    : execFileSync('git', [...args, 'ls-files', '-z'], { encoding: 'utf8' })
)
  .split('\0')
  .filter(Boolean);
const localArtifact =
  /(^|\/)(VERCEL|DEMO_SHOWCASE|VALIDATION)\.md$|(^|\/)docs\/(verification|roadmap|release-checklist|deploy)\.md$|(^|\/)[^/]+-(validation-report|handoff)\.md$|(^|\/)docs\/images\/demo-showcase-/i;
const localDirectory =
  /(^|\/)(openspec|node_modules|\.vercel|\.aws|\.codex|\.agents|\.local|\.git-local)(\/|$)/;
const instructions = /(^|\/)(AGENTS|CLAUDE|GEMINI)\.md$/;
const forbidden = files.filter(
  (f) =>
    localDirectory.test(f) ||
    instructions.test(f) ||
    (/(^|\/)\.env($|\.)/.test(f) && !f.endsWith('.env.example')) ||
    localArtifact.test(f),
);
if (forbidden.length)
  throw new Error('Unexpected private/generated/instruction files in Git: ' + forbidden.join(', '));
for (const file of files.filter((f) => /\.(js|jsx|json|md|yml)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  if (/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))
    throw new Error('Private key in tracked source: ' + file);
}
console.info(
  `${files.length} tracked paths checked; no private planning, secret env, instruction files or private keys.`,
);
