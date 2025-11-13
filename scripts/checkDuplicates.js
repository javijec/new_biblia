import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const booksDir = path.join(__dirname, '../src/data/books');

// Verificar cada libro
const files = fs.readdirSync(booksDir).filter(f => f.endsWith('.json') && f !== 'index.json');

console.log('🔍 Buscando capítulos duplicados...\n');

let totalDuplicates = 0;

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(booksDir, file), 'utf-8'));
  const dupes = {};
  
  data.chapters.forEach(c => {
    dupes[c.number] = (dupes[c.number] || 0) + 1;
  });
  
  const repeated = Object.entries(dupes).filter(([_, count]) => count > 1);
  
  if (repeated.length > 0) {
    console.log(`❌ ${data.name}:`);
    repeated.forEach(([num, count]) => {
      console.log(`   Capítulo ${num}: aparece ${count} veces`);
      totalDuplicates += count - 1;
    });
  }
});

console.log(`\n📊 Total de capítulos duplicados: ${totalDuplicates}`);
