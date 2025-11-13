#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const INPUT = path.join(process.cwd(), 'src', 'data', 'bible.json');
if (!fs.existsSync(INPUT)) {
  console.error('Input not found:', INPUT);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const results = [];

(raw.testaments || []).forEach(t => {
  (t.books || []).forEach(b => {
    const map = new Map();
    (b.chapters || []).forEach(ch => {
      const n = ch.number || 0;
      if (!map.has(n)) map.set(n, []);
      map.get(n).push({ file: ch.file, verses: (ch.verses || []).length });
    });

    const duplicates = [];
    for (const [num, arr] of map.entries()) {
      if (arr.length > 1) duplicates.push({ chapter: num, instances: arr });
    }

    if (duplicates.length) {
      results.push({ testament: t.name, bookId: b.id, bookName: b.name, duplicates });
    }
  });
});

if (results.length === 0) {
  console.log('No duplicate chapters found.');
  process.exit(0);
}

console.log(`Found ${results.length} books with duplicate chapter numbers\n`);
results.sort((a,b)=> b.duplicates.length - a.duplicates.length);
results.slice(0, 50).forEach((r, idx) => {
  console.log(`${idx+1}. ${r.testament} / ${r.bookName} (id=${r.bookId}) — ${r.duplicates.length} duplicated chapter numbers`);
  r.duplicates.slice(0,10).forEach(d => {
    console.log(`   - Chapter ${d.chapter} has ${d.instances.length} files:`);
    d.instances.slice(0,5).forEach(i => console.log(`       ${i.file} (verses=${i.verses})`));
  });
  console.log('');
});

// summary
const totalDupChapters = results.reduce((s, r) => s + r.duplicates.length, 0);
const totalBooks = results.length;
console.log(`Summary: ${totalBooks} books, ${totalDupChapters} duplicated chapter numbers (showing up to 50 books).`);
