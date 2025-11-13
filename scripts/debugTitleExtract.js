#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const BIBLE_DIR = path.join(process.cwd(), '..', 'old_biblia');
const file = process.argv[2] || '__PGA.HTM';
const fp = path.join(process.cwd(), '..', 'old_biblia', file);
if (!fs.existsSync(fp)) { console.error('file not found', fp); process.exit(1); }
const html = fs.readFileSync(fp, 'latin1');
console.log('File:', file);
const titleMatch = html.match(/<p\s+class=TtulodelLibro[^>]*>([^<]+)<\/p>/i);
const chapterMatch = html.match(/<p\s+class=Capitulo[^>]*>Cap&iacu;?tulo\s*(\d+)<\/p>/i) || html.match(/<p\s+class=Capitulo[^>]*>Capítulo\s*(\d+)<\/p>/i);
console.log('titleMatch:', !!titleMatch, titleMatch && titleMatch[1]);
console.log('chapterMatch:', !!chapterMatch, chapterMatch && chapterMatch[1]);
const metaPart = html.match(/<meta[^>]*name=["']?part["']?[^>]*content=["']([^"']+)["'][^>]*>/i);
console.log('meta.part:', metaPart && metaPart[1]);
const enunciado = html.match(/<p\s+class=Enunciado[^>]*>([^<]+)<\/p>/i);
console.log('enunciado:', enunciado && enunciado[1]);
