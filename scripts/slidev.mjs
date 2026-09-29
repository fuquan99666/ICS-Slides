#!/usr/bin/env node
/**
 * Slidev deck manager.
 *
 * Scans `slides/*.md` so you never have to register a new deck manually.
 * A deck's number is taken from the numeric prefix of its filename
 * (e.g. `02-Machine-Programming-I.md` -> number `2`), which maps to:
 *   base: /ICS-Slides/<number>/
 *   out:  ../dist/<number>/
 *
 * Usage:
 *   node scripts/slidev.mjs dev [deck]       # dev one deck (default: first)
 *   node scripts/slidev.mjs build [deck]     # build one deck
 *   node scripts/slidev.mjs build:all        # build every deck + landing page
 *   node scripts/slidev.mjs list             # list discovered decks
 *
 * `deck` may be a full name (`02-Machine-Programming-I`) or just the
 * number (`2`).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SLIDES_DIR = join(ROOT, 'slides');
const SITE_BASE = (process.env.ICS_SITE_BASE || '/ICS-Slides').replace(/\/$/, '');

function discoverDecks() {
  return readdirSync(SLIDES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('.'))
    .sort()
    .map((file) => {
      const name = file.replace(/\.md$/, '');
      const m = name.match(/^(\d+)[-_](.*)$/);
      const number = m ? String(Number(m[1])) : name;
      const slug = m ? m[2] : name;
      return { file, name, number, slug };
    });
}

function deckTitle(deck) {
  const raw = readFileSync(join(SLIDES_DIR, deck.file), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*(.+)$/m);
    if (t) return humanize(t[1].trim());
  }
  return humanize(deck.slug);
}

/** Turn `02-Machine-Programming-I` into `Machine Programming I`. */
function humanize(text) {
  return text
    .replace(/^\d+[-_\s]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function resolveDeck(decks, key) {
  if (!key) return decks[0];
  const found = decks.find((d) => d.number === key || d.name === key || d.slug === key);
  if (!found) {
    console.error(`No deck matches "${key}". Available:`);
    for (const d of decks) console.error(`  ${d.number}  ${d.name}`);
    process.exit(1);
  }
  return found;
}

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { stdio: 'inherit', cwd: ROOT, ...opts });
}

const slidevBin = join(ROOT, 'node_modules', '.bin', 'slidev');

function dev(deck) {
  run(slidevBin, [join('slides', deck.file)]);
}

function buildDeck(deck) {
  const out = join('..', 'dist', deck.number);
  run(slidevBin, [
    'build',
    join('slides', deck.file),
    '--base',
    `${SITE_BASE}/${deck.number}/`,
    '--out',
    out,
  ]);
}

function writeLandingPage(decks) {
  const templatePath = join(ROOT, 'public', 'index.html');
  const template = readFileSync(templatePath, 'utf8');
  const links = decks
    .map((d) => {
      const label = deckTitle(d);
      return `      <a href="${SITE_BASE}/${d.number}/" class="course-link">\n` +
        `        <span class="badge">${d.number}</span>${label}\n` +
        `        <span class="arrow">→</span>\n` +
        `      </a>`;
    })
    .join('\n');
  const html = template.replace(
    /(<div class="course-grid">)[\s\S]*?(<\/div>)/,
    `$1\n${links}\n    $2`,
  );
  const distDir = join(ROOT, 'dist');
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
  const outPath = join(distDir, 'index.html');
  writeFileSync(outPath, html);
  console.log(`\nGenerated landing page -> ${outPath}`);
}

function buildAll(decks) {
  for (const d of decks) buildDeck(d);
  writeLandingPage(decks);
}

const [cmd, key] = process.argv.slice(2);
const decks = discoverDecks();

if (!decks.length) {
  console.error('No decks found in slides/');
  process.exit(1);
}

switch (cmd) {
  case 'dev':
    dev(resolveDeck(decks, key));
    break;
  case 'build':
    buildDeck(resolveDeck(decks, key));
    break;
  case 'build:all':
    buildAll(decks);
    break;
  case 'list':
    for (const d of decks) console.log(`${d.number}\t${d.name}\t${deckTitle(d)}`);
    break;
  default:
    console.error('Usage: node scripts/slidev.mjs <dev|build|build:all|list> [deck]');
    process.exit(1);
}
