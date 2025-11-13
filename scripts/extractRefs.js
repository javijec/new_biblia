#!/usr/bin/env node

/**
 * extractRefs.js
 * Scanea los archivos HTML con vínculos (_P*.HTM) y extrae los HREFs
 * encontrados dentro de cada versículo. Guarda un mapa en
 * src/data/verse-refs.json con claves "__Pxxx.HTM:verseNumber" => [ { href, text } ]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIBLE_DIR = path.join(__dirname, '../../old_biblia');
const OUTPUT = path.join(process.cwd(), 'src', 'data', 'verse-refs.json');

function normalizeToDoubleUnderscore(fileName) {
  // If file starts with single underscore ('_P...') convert to '__P...'
  if (fileName.startsWith('_') && !fileName.startsWith('__')) {
    return `_${fileName}`; // add one more underscore
  }
  return fileName;
}

function extractFromHtml(html, file) {
  const $ = load(html);
  const refs = {};

  $('p.MsoNormal').each((i, p) => {
    const paragraph = $(p);

    // try to find verse number: either starting text '1 ' or first <a> whose text is the number
    let verseNumber = null;

    // check for an <a> as first element with numeric text
    const firstA = paragraph.find('a').first();
    if (firstA && firstA.text() && /^\d+$/.test(firstA.text().trim())) {
      verseNumber = parseInt(firstA.text().trim(), 10);
    } else {
      // fallback: try to read plaintext start
      const text = paragraph.text().trim();
      const m = text.match(/^(\d+)\s+/);
      if (m) verseNumber = parseInt(m[1], 10);
    }

    // collect all anchors inside this paragraph
    const anchors = [];
    paragraph.find('a').each((j, a) => {
      const href = $(a).attr('href') || '';
      const txt = $(a).text() || '';
      if (href) anchors.push({ href: href.trim(), text: txt.trim() });
    });

    if ((verseNumber || verseNumber === 0) && anchors.length > 0) {
      const key = `${normalizeToDoubleUnderscore(file)}:${verseNumber}`;
      refs[key] = refs[key] || [];
      refs[key].push(...anchors);
    }
  });

  return refs;
}

async function run() {
  console.log('🔎 Extrayendo referencias de los archivos _P*.HTM...');

  const files = fs.readdirSync(BIBLE_DIR).filter(f => f.startsWith('_P') && f.endsWith('.HTM'));
  console.log(`📂 Archivos con vínculos encontrados: ${files.length}`);

  const refsMap = {};

  for (const file of files) {
    try {
      const p = path.join(BIBLE_DIR, file);
      const html = fs.readFileSync(p, 'latin1');
      const refs = extractFromHtml(html, file);
      Object.assign(refsMap, refs);
    } catch (err) {
      console.error(`⚠ Error leyendo ${file}: ${err.message}`);
    }
  }

  // ensure output dir
  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(OUTPUT, JSON.stringify(refsMap, null, 2), 'utf8');
  console.log(`✅ Referencias extraídas: ${Object.keys(refsMap).length} entradas`);
  console.log(`💾 Guardado en: ${OUTPUT}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
