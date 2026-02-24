import { describe, expect, it } from 'vitest';
import { sanitizeReadingHtml } from './gospelService';

describe('sanitizeReadingHtml', () => {
  it('removes scripts and dangerous attributes', () => {
    const input = `
      <img src=x onerror="alert('xss')">
      <script>alert('xss')</script>
      <p onclick="evil()">Texto seguro</p>
    `;

    const output = sanitizeReadingHtml(input);

    expect(output).toContain('Texto seguro');
    expect(output).not.toContain('<script');
    expect(output).not.toContain('onerror=');
    expect(output).not.toContain('onclick=');
    expect(output).not.toContain('<img');
  });

  it('keeps only allowed formatting tags', () => {
    const input = '<strong>Amén</strong><br><em>Paz</em><a href="javascript:alert(1)">link</a>';

    const output = sanitizeReadingHtml(input);

    expect(output).toContain('<strong>Amén</strong>');
    expect(output).toContain('<em>Paz</em>');
    expect(output).toContain('<br>');
    expect(output).not.toContain('<a');
    expect(output).toContain('link');
  });

  it('returns empty string for empty or non-readable input', () => {
    expect(sanitizeReadingHtml('   ')).toBe('');
    expect(sanitizeReadingHtml('<script>alert(1)</script>')).toBe('');
    expect(sanitizeReadingHtml(null)).toBe('');
  });
});
