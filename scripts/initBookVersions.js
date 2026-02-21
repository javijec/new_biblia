import fs from 'node:fs/promises';
import path from 'node:path';

const INDEX_PATH = path.join(process.cwd(), 'public', 'books', 'index.json');

function buildInitialVersion(seed, offset) {
  return String(seed + offset);
}

async function main() {
  const raw = await fs.readFile(INDEX_PATH, 'utf-8');
  const index = JSON.parse(raw);

  if (!Array.isArray(index.books)) {
    throw new Error('Formato invalido: "books" no es un arreglo');
  }

  const seed = Date.now();
  let initialized = 0;

  index.books.forEach((book, i) => {
    if (!book.version) {
      book.version = buildInitialVersion(seed, i);
      initialized += 1;
    }
  });

  await fs.writeFile(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, 'utf-8');

  console.log(`Libros inicializados con version: ${initialized}`);
  console.log(`Total libros: ${index.books.length}`);
}

main().catch((error) => {
  console.error('Error inicializando versiones:', error);
  process.exit(1);
});
