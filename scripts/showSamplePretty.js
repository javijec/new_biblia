#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const INPUT = path.join(process.cwd(), 'src', 'data', 'bible.json');
if (!fs.existsSync(INPUT)) {
  console.error('Input not found:', INPUT);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const first = raw.testaments && raw.testaments[0];
if (!first) {
  console.error('No testaments found');
  process.exit(1);
}

console.log(`Testamento: ${first.name} (key=${first.key})\n`);
const books = first.books.slice(0,5);
books.forEach((b, i) => {
  console.log(`${i+1}. Libro: ${b.name} (id=${b.id})`);
  const chs = b.chapters.slice(0,2);
  chs.forEach(c => {
    console.log(`   - Capítulo ${c.number} (file=${c.file})`);
    (c.verses || []).slice(0,2).forEach(v => {
      const txt = (v.text || '').replace(/\s+/g,' ').slice(0,200);
      console.log(`       ${v.number}. ${txt}`);
    });
  });
  console.log('');
});
