#!/usr/bin/env node

/**
 * Script para generar conjugaciones de verbos regulares en español
 * Uso: node generateVerbConjugations.js "hablar" "comer" "vivir"
 * 
 * Generará un objeto con todas las conjugaciones para agregar a verbConjugations.js
 */

const regularVerbTemplates = {
  // Verbos terminados en -AR (hablar, amar, cantar, etc.)
  'ar': {
    infinitive: (stem) => stem + 'ar',
    present: (stem) => [`${stem}o`, `${stem}as`, `${stem}a`, `${stem}amos`, `${stem}áis`, `${stem}an`],
    imperfect: (stem) => [`${stem}aba`, `${stem}abas`, `${stem}ábamos`, `${stem}abais`, `${stem}aban`],
    preterite: (stem) => [`${stem}é`, `${stem}aste`, `${stem}ó`, `${stem}amos`, `${stem}asteis`, `${stem}aron`],
    future: (stem) => [`${stem}aré`, `${stem}arás`, `${stem}ará`, `${stem}aremos`, `${stem}aréis`, `${stem}arán`],
    conditional: (stem) => [`${stem}aría`, `${stem}arías`, `${stem}aríamos`, `${stem}aríais`, `${stem}arían`],
    presentSubjunctive: (stem) => [`${stem}e`, `${stem}es`, `${stem}emos`, `${stem}éis`, `${stem}en`],
    imperfectSubjunctive: (stem) => [`${stem}ara`, `${stem}aras`, `${stem}áramos`, `${stem}arais`, `${stem}aran`, `${stem}ase`, `${stem}ases`, `${stem}ásemos`, `${stem}aseis`, `${stem}asen`],
    gerund: (stem) => `${stem}ando`,
    pastParticiple: (stem) => [`${stem}ado`, `${stem}ada`, `${stem}ados`, `${stem}adas`],
  },
  
  // Verbos terminados en -ER (comer, temer, vender, etc.)
  'er': {
    infinitive: (stem) => stem + 'er',
    present: (stem) => [`${stem}o`, `${stem}es`, `${stem}e`, `${stem}emos`, `${stem}éis`, `${stem}en`],
    imperfect: (stem) => [`${stem}ía`, `${stem}ías`, `${stem}íamos`, `${stem}íais`, `${stem}ían`],
    preterite: (stem) => [`${stem}í`, `${stem}iste`, `${stem}ió`, `${stem}imos`, `${stem}isteis`, `${stem}ieron`],
    future: (stem) => [`${stem}eré`, `${stem}erás`, `${stem}erá`, `${stem}eremos`, `${stem}eréis`, `${stem}erán`],
    conditional: (stem) => [`${stem}ería`, `${stem}erías`, `${stem}eríamos`, `${stem}eríais`, `${stem}erían`],
    presentSubjunctive: (stem) => [`${stem}a`, `${stem}as`, `${stem}amos`, `${stem}áis`, `${stem}an`],
    imperfectSubjunctive: (stem) => [`${stem}iera`, `${stem}ieras`, `${stem}iéramos`, `${stem}ierais`, `${stem}ieran`, `${stem}iese`, `${stem}ieses`, `${stem}iésemos`, `${stem}ieseis`, `${stem}iesen`],
    gerund: (stem) => `${stem}iendo`,
    pastParticiple: (stem) => [`${stem}ido`, `${stem}ida`, `${stem}idos`, `${stem}idas`],
  },
  
  // Verbos terminados en -IR (vivir, partir, subir, etc.)
  'ir': {
    infinitive: (stem) => stem + 'ir',
    present: (stem) => [`${stem}o`, `${stem}es`, `${stem}e`, `${stem}imos`, `${stem}ís`, `${stem}en`],
    imperfect: (stem) => [`${stem}ía`, `${stem}ías`, `${stem}íamos`, `${stem}íais`, `${stem}ían`],
    preterite: (stem) => [`${stem}í`, `${stem}iste`, `${stem}ió`, `${stem}imos`, `${stem}isteis`, `${stem}ieron`],
    future: (stem) => [`${stem}iré`, `${stem}irás`, `${stem}irá`, `${stem}iremos`, `${stem}iréis`, `${stem}irán`],
    conditional: (stem) => [`${stem}iría`, `${stem}irías`, `${stem}iríamos`, `${stem}iríais`, `${stem}irían`],
    presentSubjunctive: (stem) => [`${stem}a`, `${stem}as`, `${stem}amos`, `${stem}áis`, `${stem}an`],
    imperfectSubjunctive: (stem) => [`${stem}iera`, `${stem}ieras`, `${stem}iéramos`, `${stem}ierais`, `${stem}ieran`, `${stem}iese`, `${stem}ieses`, `${stem}iésemos`, `${stem}ieseis`, `${stem}iesen`],
    gerund: (stem) => `${stem}iendo`,
    pastParticiple: (stem) => [`${stem}ido`, `${stem}ida`, `${stem}idos`, `${stem}idas`],
  },
};

function generateConjugations(infinitive) {
  let ending, stem, type;
  
  if (infinitive.endsWith('ar')) {
    ending = 'ar';
    stem = infinitive.slice(0, -2);
    type = 'ar';
  } else if (infinitive.endsWith('er')) {
    ending = 'er';
    stem = infinitive.slice(0, -2);
    type = 'er';
  } else if (infinitive.endsWith('ir')) {
    ending = 'ir';
    stem = infinitive.slice(0, -2);
    type = 'ir';
  } else {
    console.error(`❌ Error: "${infinitive}" no termina en -ar, -er o -ir`);
    return null;
  }

  const templates = regularVerbTemplates[type];
  const conjugations = {};

  // Generar todas las formas
  Object.entries(templates).forEach(([tense, generator]) => {
    const forms = generator(stem);
    
    if (Array.isArray(forms)) {
      forms.forEach(form => {
        conjugations[form] = infinitive;
      });
    } else {
      conjugations[forms] = infinitive;
    }
  });

  return { infinitive, conjugations };
}

function formatAsJavaScript(verbList) {
  let output = '// VERBOS GENERADOS AUTOMÁTICAMENTE\n';
  
  verbList.forEach(({ infinitive, conjugations }) => {
    const infinitiveUpper = infinitive.toUpperCase();
    output += `// ${infinitiveUpper}\n`;
    
    const entries = Object.entries(conjugations)
      .map(([conj, inf]) => `'${conj}': '${inf}'`)
      .join(', ');
    
    output += entries + ',\n\n';
  });

  return output;
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📚 Generador de Conjugaciones Verbales en Español

Uso: node generateVerbConjugations.js <infinitivo1> <infinitivo2> ...

Ejemplos:
  node generateVerbConjugations.js amar
  node generateVerbConjugations.js leer escribir cantar
  node generateVerbConjugations.js comprar vender partir

Verbos soportados: Regulares terminados en -ar, -er, -ir

⚠️ Nota: Para verbos irregulares, deberás agregarlo manualmente a verbConjugations.js
  `);
  process.exit(0);
}

const results = [];

args.forEach(verb => {
  const result = generateConjugations(verb);
  if (result) {
    results.push(result);
    console.log(`✅ ${verb.toUpperCase()}: ${Object.keys(result.conjugations).length} formas generadas`);
  }
});

console.log('\n' + '='.repeat(50));
console.log('COPIA Y PEGA EN verbConjugations.js:');
console.log('='.repeat(50) + '\n');

console.log(formatAsJavaScript(results));

console.log('\n' + '='.repeat(50));
console.log('Pasos siguientes:');
console.log('1. Copia el código anterior');
console.log('2. Abre src/hooks/verbConjugations.js');
console.log('3. Pega el código en la sección correspondiente');
console.log('4. ¡Listo! Los nuevos verbos estarán disponibles');
console.log('='.repeat(50));
