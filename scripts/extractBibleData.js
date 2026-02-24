#!/usr/bin/env node

/**
 * Script para extraer contenido de la Biblia desde archivos HTML
 * Convierte los archivos HTM de old_biblia en un JSON estructurado
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIBLE_DIR = path.join(__dirname, '../../../old_biblia');
const OUTPUT_FILE = path.join(__dirname, '../src/data/bible-data.json');

// Información de libros (basada en el índice)
const booksInfo = {
  genesis: { testament: 'Antiguo Testamento', name: 'Génesis', chapters: 50 },
  exodo: { testament: 'Antiguo Testamento', name: 'Éxodo', chapters: 40 },
  levitico: { testament: 'Antiguo Testamento', name: 'Levítico', chapters: 27 },
  numeros: { testament: 'Antiguo Testamento', name: 'Números', chapters: 36 },
  deuteronomio: { testament: 'Antiguo Testamento', name: 'Deuteronomio', chapters: 34 },
  josue: { testament: 'Antiguo Testamento', name: 'Josué', chapters: 24 },
  jueces: { testament: 'Antiguo Testamento', name: 'Jueces', chapters: 21 },
  '1samuel': { testament: 'Antiguo Testamento', name: 'I Samuel', chapters: 31 },
  '2samuel': { testament: 'Antiguo Testamento', name: 'II Samuel', chapters: 24 },
  '1reyes': { testament: 'Antiguo Testamento', name: 'I Reyes', chapters: 22 },
  '2reyes': { testament: 'Antiguo Testamento', name: 'II Reyes', chapters: 25 },
  isaias: { testament: 'Antiguo Testamento', name: 'Isaías', chapters: 66 },
  jeremias: { testament: 'Antiguo Testamento', name: 'Jeremías', chapters: 52 },
  ezequiel: { testament: 'Antiguo Testamento', name: 'Ezequiel', chapters: 48 },
  oseas: { testament: 'Antiguo Testamento', name: 'Oseas', chapters: 14 },
  joel: { testament: 'Antiguo Testamento', name: 'Joel', chapters: 4 },
  amos: { testament: 'Antiguo Testamento', name: 'Amós', chapters: 9 },
  abdias: { testament: 'Antiguo Testamento', name: 'Abdías', chapters: 1 },
  jonas: { testament: 'Antiguo Testamento', name: 'Jonás', chapters: 4 },
  miqueas: { testament: 'Antiguo Testamento', name: 'Miqueas', chapters: 7 },
  nahum: { testament: 'Antiguo Testamento', name: 'Nahúm', chapters: 3 },
  habacuc: { testament: 'Antiguo Testamento', name: 'Habacuc', chapters: 3 },
  sofonias: { testament: 'Antiguo Testamento', name: 'Sofonías', chapters: 3 },
  ageo: { testament: 'Antiguo Testamento', name: 'Ageo', chapters: 2 },
  zacarias: { testament: 'Antiguo Testamento', name: 'Zacarías', chapters: 14 },
  malaquias: { testament: 'Antiguo Testamento', name: 'Malaquías', chapters: 3 },
  salmos: { testament: 'Antiguo Testamento', name: 'Salmos', chapters: 150 },
  job: { testament: 'Antiguo Testamento', name: 'Job', chapters: 42 },
  proverbios: { testament: 'Antiguo Testamento', name: 'Proverbios', chapters: 31 },
  rut: { testament: 'Antiguo Testamento', name: 'Rut', chapters: 4 },
  cantar: { testament: 'Antiguo Testamento', name: 'Cantar de los Cantares', chapters: 8 },
  eclesiastes: { testament: 'Antiguo Testamento', name: 'Eclesiastés', chapters: 12 },
  lamentaciones: { testament: 'Antiguo Testamento', name: 'Lamentaciones', chapters: 5 },
  ester: { testament: 'Antiguo Testamento', name: 'Ester', chapters: 10 },
  daniel: { testament: 'Antiguo Testamento', name: 'Daniel', chapters: 12 },
  '1cronicas': { testament: 'Antiguo Testamento', name: 'I Crónicas', chapters: 29 },
  '2cronicas': { testament: 'Antiguo Testamento', name: 'II Crónicas', chapters: 36 },
  esdras: { testament: 'Antiguo Testamento', name: 'Esdras', chapters: 10 },
  nehemias: { testament: 'Antiguo Testamento', name: 'Nehemías', chapters: 13 },
  mateo: { testament: 'Nuevo Testamento', name: 'Mateo', chapters: 28 },
  marcos: { testament: 'Nuevo Testamento', name: 'Marcos', chapters: 16 },
  lucas: { testament: 'Nuevo Testamento', name: 'Lucas', chapters: 24 },
  juan: { testament: 'Nuevo Testamento', name: 'Juan', chapters: 21 },
  hechos: { testament: 'Nuevo Testamento', name: 'Hechos', chapters: 28 },
  romanos: { testament: 'Nuevo Testamento', name: 'Romanos', chapters: 16 },
  '1corintios': { testament: 'Nuevo Testamento', name: 'I Corintios', chapters: 16 },
  '2corintios': { testament: 'Nuevo Testamento', name: 'II Corintios', chapters: 13 },
  galatas: { testament: 'Nuevo Testamento', name: 'Gálatas', chapters: 6 },
  efesios: { testament: 'Nuevo Testamento', name: 'Efesios', chapters: 6 },
  filipenses: { testament: 'Nuevo Testamento', name: 'Filipenses', chapters: 4 },
  colosenses: { testament: 'Nuevo Testamento', name: 'Colosenses', chapters: 4 },
  '1tesalonicenses': { testament: 'Nuevo Testamento', name: 'I Tesalonicenses', chapters: 5 },
  '2tesalonicenses': { testament: 'Nuevo Testamento', name: 'II Tesalonicenses', chapters: 3 },
  '1timoteo': { testament: 'Nuevo Testamento', name: 'I Timoteo', chapters: 6 },
  '2timoteo': { testament: 'Nuevo Testamento', name: 'II Timoteo', chapters: 4 },
  tito: { testament: 'Nuevo Testamento', name: 'Tito', chapters: 3 },
  filemon: { testament: 'Nuevo Testamento', name: 'Filemón', chapters: 1 },
  hebreos: { testament: 'Nuevo Testamento', name: 'Hebreos', chapters: 13 },
  santiago: { testament: 'Nuevo Testamento', name: 'Santiago', chapters: 5 },
  '1pedro': { testament: 'Nuevo Testamento', name: 'I Pedro', chapters: 5 },
  '2pedro': { testament: 'Nuevo Testamento', name: 'II Pedro', chapters: 3 },
  '1juan': { testament: 'Nuevo Testamento', name: 'I Juan', chapters: 5 },
  '2juan': { testament: 'Nuevo Testamento', name: 'II Juan', chapters: 1 },
  '3juan': { testament: 'Nuevo Testamento', name: 'III Juan', chapters: 1 },
  judas: { testament: 'Nuevo Testamento', name: 'Judas', chapters: 1 },
  apocalipsis: { testament: 'Nuevo Testamento', name: 'Apocalipsis', chapters: 22 },
};

function cleanText(html) {
  if (!html) return '';
  
  // Decodificar HTML entities
  let text = html
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '') // Remover tags HTML
    .trim();
  
  return text;
}

function extractVerses(html) {
  const $ = load(html);
  const verses = [];
  
  // Buscar párrafos con versículos
  $('p.MsoNormal').each((index, element) => {
    const text = $(element).text().trim();
    if (text) {
      // Cada versículo comienza con un número seguido de un espacio
      const match = text.match(/^(\d+)\s+(.+)$/);
      if (match) {
        verses.push({
          number: parseInt(match[1]),
          text: cleanText(match[2]),
        });
      }
    }
  });
  
  return verses;
}

function extractChapterNumber(html) {
  const match = html.match(/Capítulo\s*(\d+)|Cap&iacute;tulo\s*(\d+)/i);
  return match ? parseInt(match[1] || match[2]) : 1;
}

async function processFile(filePath, filename) {
  try {
    const html = fs.readFileSync(filePath, 'latin1');
    const verses = extractVerses(html);
    const chapter = extractChapterNumber(html);
    
    return {
      filename,
      chapter,
      verses: verses.length > 0 ? verses : null,
    };
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Extrayendo datos de la Biblia...\n');
  
  // Leer índice para obtener estructura de libros y capítulos
  const indexPath = path.join(BIBLE_DIR, '_INDEX.HTM');
  fs.readFileSync(indexPath, 'latin1');
  
  // Procesar archivos
  const files = fs.readdirSync(BIBLE_DIR).filter(f => f.startsWith('__P') && f.endsWith('.HTM'));
  
  console.log(`Found ${files.length} chapter files\n`);
  
  const processedData = {};
  
  for (const file of files) {
    const filePath = path.join(BIBLE_DIR, file);
    const result = await processFile(filePath, file);
    
    if (result && result.verses) {
      if (!processedData[result.chapter]) {
        processedData[result.chapter] = [];
      }
      processedData[result.chapter].push(result);
    }
  }
  
  // Crear estructura final
  const finalData = {
    version: 'Biblia del Pueblo de Dios',
    language: 'es',
    testament: {
      old: [],
      new: [],
    },
  };
  
  // Organizar por testamentos
  Object.entries(booksInfo).forEach(([bookId, bookInfo]) => {
    const book = {
      id: bookId,
      name: bookInfo.name,
      abbreviation: bookInfo.name.substring(0, 3).toUpperCase(),
      chapters: [],
    };
    
    for (let ch = 1; ch <= bookInfo.chapters; ch++) {
      book.chapters.push({
        number: ch,
        verses: [], // Se llenará si hay datos
      });
    }
    
    if (bookInfo.testament === 'Antiguo Testamento') {
      finalData.testament.old.push(book);
    } else {
      finalData.testament.new.push(book);
    }
  });
  
  // Crear directorio de salida si no existe
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Guardar datos
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
  
  console.log(`\n✅ Datos extraídos y guardados en: ${OUTPUT_FILE}`);
  console.log(`📚 Testamentos: ${finalData.testament.old.length + finalData.testament.new.length} libros`);
}

main().catch(console.error);
