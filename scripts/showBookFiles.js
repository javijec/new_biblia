#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const INPUT = path.join(process.cwd(), 'src', 'data', 'bible-complete.json');
if (!fs.existsSync(INPUT)) { console.error('Input not found'); process.exit(1); }
const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const book = process.argv[2] || 'ZACARIAS';
const matches = raw.chapters.filter(ch => (ch.bookTitle||'').toUpperCase() === book.toUpperCase());
console.log(`Found ${matches.length} chapters for book: ${book}\n`);
matches.slice(0,200).forEach((ch, i) => {
  console.log(i+1, ch.file, 'chapterNumber=', ch.chapterNumber, 'verses=', ch.verses.length);
});
// print sample around first match index in whole file
if (matches.length>0) {
  const firstFile = matches[0].file;
  const idx = raw.chapters.findIndex(c=>c.file===firstFile);
  console.log('\nContext around first match (5 before, 5 after):');
  raw.chapters.slice(Math.max(0, idx-5), idx+6).forEach((c, i) => console.log((idx-5+i), c.file, c.bookTitle));
}
