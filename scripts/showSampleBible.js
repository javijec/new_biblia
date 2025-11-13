#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const INPUT = path.join(process.cwd(), 'src', 'data', 'bible.json');
if (!fs.existsSync(INPUT)) {
  console.error('Input not found:', INPUT);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
if (!raw.testaments || raw.testaments.length === 0) {
  console.error('No testaments found in', INPUT);
  process.exit(1);
}

const first = raw.testaments[0];
const sample = {
  name: first.name,
  key: first.key,
  books: first.books.slice(0, 5).map(b => ({
    id: b.id,
    name: b.name,
    chapters: b.chapters.slice(0, 2).map(c => ({
      number: c.number,
      file: c.file,
      verses: (c.verses || []).slice(0, 3)
    }))
  }))
};

console.log(JSON.stringify(sample, null, 2));
