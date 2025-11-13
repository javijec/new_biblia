#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const INPUT = path.join(process.cwd(), 'src', 'data', 'bible-complete.json');
if (!fs.existsSync(INPUT)) {
  console.error('Input not found:', INPUT);
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const counts = new Map();
raw.chapters.forEach(ch => {
  const t = (ch.bookTitle || '<<NULL>>').trim();
  counts.set(t, (counts.get(t) || 0) + 1);
});
const arr = Array.from(counts.entries()).sort((a,b) => b[1]-a[1]);
console.log('Unique bookTitle values:', arr.length);
console.log('Top 30:');
arr.slice(0,30).forEach(([k,v]) => console.log(v.toString().padStart(4),' - ', k));
console.log('\nSample entries where bookTitle is null:');
raw.chapters.filter(ch=>!ch.bookTitle).slice(0,5).forEach(ch=>console.log(ch.file, ch.verses.slice(0,3)));
