import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Leer la Biblia completa
const biblePath = path.join(__dirname, '../src/data/bible-complete.json');
const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));

// Directorio de salida
const outputDir = path.join(__dirname, '../src/data/books');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Agrupar capítulos por libro
const bookMap = {};
const bookOrder = []; // Para mantener el orden

bibleData.chapters.forEach((chapter) => {
  const bookId = chapter.bookTitle.toLowerCase().replace(/\s+/g, '-');
  
  if (!bookMap[bookId]) {
    bookMap[bookId] = {
      id: bookId,
      name: chapter.bookTitle,
      testament: chapter.testament,
      chapters: [],
      seenChapterNumbers: new Set() // Rastrear capítulos ya vistos
    };
    bookOrder.push(bookId);
  }
  
  // Solo agregar el capítulo si no lo hemos visto antes
  if (!bookMap[bookId].seenChapterNumbers.has(chapter.chapterNumber)) {
    bookMap[bookId].chapters.push({
      number: chapter.chapterNumber,
      file: chapter.file,
      verses: chapter.verses
    });
    bookMap[bookId].seenChapterNumbers.add(chapter.chapterNumber);
  }
});

// Crear archivo por libro - ORDENAR CAPÍTULOS POR NÚMERO
console.log(`📖 Generando ${bookOrder.length} libros...`);

bookOrder.forEach((bookId, index) => {
  const book = bookMap[bookId];
  
  // Ordenar capítulos numéricamente
  book.chapters.sort((a, b) => a.number - b.number);
  
  const bookFile = path.join(outputDir, `${bookId}.json`);
  
  fs.writeFileSync(bookFile, JSON.stringify(book, null, 2));
  console.log(`✓ ${index + 1}. ${book.name} (${book.chapters.length} capítulos)`);
});

// Crear índice de libros para carga rápida
const bookIndex = {
  version: bibleData.version,
  language: bibleData.language,
  source: bibleData.source,
  totals: bibleData.totals,
  books: bookOrder.map((bookId) => {
    const book = bookMap[bookId];
    return {
      id: book.id,
      name: book.name,
      testament: book.testament,
      chapters: book.chapters.length
    };
  })
};

const indexPath = path.join(outputDir, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(bookIndex, null, 2));

console.log('\n✅ Índice creado en:', indexPath);
console.log(`📊 Total de libros: ${bookOrder.length}`);
