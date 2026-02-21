import { describe, expect, it } from 'vitest';
import { normalizeVerb } from './verbConjugations';

describe('normalizeVerb', () => {
  it('normaliza conjugaciones comunes a su infinitivo', () => {
    expect(normalizeVerb('Soy')).toBe('ser');
    expect(normalizeVerb('Estuvo')).toBe('estar');
    expect(normalizeVerb('Hicieron')).toBe('hacer');
  });

  it('mantiene palabras que no estan en el diccionario', () => {
    expect(normalizeVerb('esperanza')).toBe('esperanza');
  });
});
