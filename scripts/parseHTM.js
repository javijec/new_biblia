#!/usr/bin/env node

/**
 * parseHTM.js (reescrito)
 * - Lee los archivos `__P*.HTM` en `old_biblia`
 * - Extrae breadcrumb (UL type=square) o meta[name="part"] que indica
 *   Testamento > Libro > Capítulo
 * - Extrae versículos (p.MsoNormal) y genera `src/data/bible-complete.json`
 *   con la forma: { version, language, source, chapters: [{ file, testament, bookTitle, chapterNumber, verses: [...] }] }
 *
 * Uso: node scripts/parseHTM.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIBLE_DIR = path.join(__dirname, '../../old_biblia');
const OUTPUT_FILE = path.join(__dirname, '../src/data/bible-complete.json');

function cleanText(s) {
  if (!s) return '';
  let t = String(s);
  // common html entities used in the source
  t = t.replace(/&aacute;/gi, 'á')
       .replace(/&eacute;/gi, 'é')
       .replace(/&iacute;/gi, 'í')
       .replace(/&oacute;/gi, 'ó')
       .replace(/&uacute;/gi, 'ú')
       .replace(/&ntilde;/gi, 'ñ')
       .replace(/&quot;/g, '"')
       .replace(/&amp;/g, '&')
       .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
       .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
       .replace(/&nbsp;/g, ' ');
  // strip tags
  t = t.replace(/<[^>]+>/g, '');
  // collapse whitespace
  return t.replace(/\s+/g, ' ').trim();
}

function parseBreadcrumb($) {
  // looks for UL type=square breadcrumb and returns array of levels
  const root = $('ul[type="square"]').first();
  if (!root || root.length === 0) return null;
  const levels = [];
  let li = root.children('li').first();
  while (li && li.length) {
    // get li text without nested UL
    const copy = li.clone();
    copy.children('ul').remove();
    const txt = cleanText(copy.text());
    if (txt) levels.push(txt);
    const nextUl = li.children('ul').first();
    if (nextUl && nextUl.length) li = nextUl.children('li').first(); else break;
  }
  return levels.length ? levels : null;
}

function parseMetaPart(html) {
  const m = html.match(/<meta[^>]+name=["']?part["']?[^>]*content=["']([^"']+)["'][^>]*>/i);
  if (!m) return null;
  // parts separated by > in the original
  return m[1].split('>').map(s => cleanText(s));
}

function extractContent(html) {
  const $ = load(html);
  const result = { testament: null, bookTitle: null, chapterNumber: null, verses: [] };

  // 1) breadcrumb (preferred)
  try {
    const crumb = parseBreadcrumb($);
    if (crumb) {
      if (crumb[0]) result.testament = crumb[0];
      if (crumb[1]) result.bookTitle = crumb[1];
      if (crumb[2]) {
        const n = parseInt(crumb[2]);
        if (!Number.isNaN(n)) result.chapterNumber = n;
      }
    }
  } catch (e) {
    // ignore and try other heuristics
  }

  // 2) meta[name=part] fallback
  if (!result.bookTitle || !result.testament || !result.chapterNumber) {
    const metaParts = parseMetaPart(html);
    if (metaParts) {
      if (!result.testament && metaParts[0]) {
        const t = metaParts[0];
        if (/antiguo/i.test(t)) result.testament = 'Antiguo Testamento';
        else if (/nuevo/i.test(t)) result.testament = 'Nuevo Testamento';
        else result.testament = t;
      }
      if (!result.bookTitle && metaParts[1]) result.bookTitle = metaParts[1];
      if (!result.chapterNumber && metaParts[2]) {
        const n = parseInt(metaParts[2]);
        if (!Number.isNaN(n)) result.chapterNumber = n;
      }
    }
  }

  // 3) small heuristics: p.Enunciado may contain "SALMO 5" or similar
  if (!result.chapterNumber) {
    const en = $('p.Enunciado').first().text();
    const m = en && en.match(/(\d+)$/);
    if (m) result.chapterNumber = parseInt(m[1]);
  }

  // 4) title fallback
  if (!result.bookTitle) {
    const titleMatch = html.match(/<p\s+class=TtulodelLibro[^>]*>([^<]+)<\/p>/i);
    if (titleMatch) result.bookTitle = cleanText(titleMatch[1]);
  }

  // Extract verses: prefer p.MsoNormal but accept other p blocks that start with a number
  const verseCandidates = $('p.MsoNormal, p');
  verseCandidates.each((i, el) => {
    const txt = $(el).text().trim();
    if (!txt) return;
    // match lines that start with a verse number
    const m = txt.match(/^(\d+)\s+(.+)$/s);
    if (m) {
      result.verses.push({ number: parseInt(m[1]), text: cleanText(m[2]) });
    }
  });

  return result;
}

async function processAllFiles() {
  console.log('🔍 Procesando archivos HTML de la Biblia (reescrito)...');

  const allFiles = fs.readdirSync(BIBLE_DIR).filter(f => f.toUpperCase().startsWith('__P') && f.toUpperCase().endsWith('.HTM'));
  // natural sort
  allFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  console.log(`📂 Encontrados ${allFiles.length} archivos`);

  const bibleData = { version: 'Biblia del Pueblo de Dios', language: 'es', source: 'Vatican (2007)', chapters: [] };
  let processed = 0, errors = 0;

  let lastTestament = null;
  let lastBook = null;

  for (const file of allFiles) {
    try {
      const fp = path.join(BIBLE_DIR, file);
      const html = fs.readFileSync(fp, 'latin1');
      const content = extractContent(html);

      // propagate when missing (intro pages earlier set them)
      if (!content.testament && lastTestament) content.testament = lastTestament;
      if (!content.bookTitle && lastBook) content.bookTitle = lastBook;
      if (content.testament) lastTestament = content.testament;
      if (content.bookTitle) lastBook = content.bookTitle;

      if (content.verses && content.verses.length) {
        bibleData.chapters.push({ file, testament: content.testament, bookTitle: content.bookTitle, chapterNumber: content.chapterNumber, verses: content.verses });
        processed++;
        if (processed % 100 === 0) console.log(`✓ ${processed} capítulos procesados...`);
      }
    } catch (e) {
      errors++;
      if (errors <= 5) console.error('Error procesando', file, e.message);
    }
  }

  // write output
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bibleData, null, 2), 'utf8');

  console.log(`\n✅ Procesamiento completado.`);
  console.log(`   Capítulos procesados: ${processed}`);
  console.log(`   Errores: ${errors}`);
  console.log(`   Versículos totales: ${bibleData.chapters.reduce((s, c) => s + c.verses.length, 0)}`);
  console.log(`   Archivo: ${OUTPUT_FILE}`);
}

processAllFiles().catch(e => { console.error(e); process.exit(1); });
